import os
import sys
import heapq

import numpy as np
import psycopg2
import pandas as pd
import json

from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder


model = SVC(kernel='rbf', C=100.0, gamma='scale', probability=True)


def getTopKNearestNeighbours(dbConnInfo, postId, k=3):
    labelEncoder = LabelEncoder()
    connString = "host={} port={} dbname={} user={} password={}".format(dbConnInfo['host'], dbConnInfo['port'], dbConnInfo['db'], dbConnInfo['username'], dbConnInfo['pwd'])

    try:

        sqlCommandExcludePetEmbeddings = """SELECT public."FacebookPosts"."postId", embedding FROM public."FacebookPosts" INNER JOIN public."FacebookPostsEmbeddings" ON public."FacebookPosts"."uuid" = public."FacebookPostsEmbeddings"."postId" WHERE public."FacebookPosts"."postId" != '{}'""".format(postId)
        sqlCommandPetEmbeddings = """SELECT public."FacebookPosts"."postId", embedding FROM public."FacebookPosts" INNER JOIN public."FacebookPostsEmbeddings" ON public."FacebookPosts"."uuid" = public."FacebookPostsEmbeddings"."postId" WHERE public."FacebookPosts"."postId" = '{}'""".format(postId)

        with psycopg2.connect(connString) as conn:
            
            # Select embeddings for all pets that aren't searched pet
            dataTrain = pd.read_sql(sqlCommandExcludePetEmbeddings, conn)
            
            # Select embeddings for searched pet
            searchedPetData = pd.read_sql(sqlCommandPetEmbeddings, conn)

            # Encode post ids into numerical values
            postIdsSet = pd.unique(dataTrain.postId.to_numpy())
            labelEncoder.fit(postIdsSet)
            numericPostIds = labelEncoder.transform(dataTrain.postId.to_numpy())

            # train the classifier model
            model.fit(np.array(dataTrain.embedding.values.tolist()), numericPostIds)
            
            # predict probabilities for each embedding
            probabilities = model.predict_proba(searchedPetData.embedding.values.tolist())
            
            # pick top k predictions
            # returns k picks: from least to most probable
            topK = np.argsort(probabilities, axis=1)[:,-k:]
            topKPredictions = np.empty(topK.shape, dtype=object)
            predictionFreqMap = {}

            for i in range(topK.shape[0]):
                embeddingPredictions = topK[i]
                # Save prediction labels for embedding i (pet ids), 
                topKPredictions[i] = labelEncoder.inverse_transform(embeddingPredictions)

                for j in range(topK.shape[1]):
                    predictedClass = topKPredictions[i][j]
                    if not predictedClass in predictionFreqMap:
                        predictionFreqMap[predictedClass] = []
                    # store probabilities (weights) for each predicted class
                    predictionFreqMap[predictedClass].append(probabilities[i][topK[i][j]])
            
            
            # predictionFreqMap should map each predicted class (pet id) to an array with
            # all the probabilities predicted for that class (considering all embeddings).
            # The length of the list should give us the frequency of that prediction across
            # all embeddings, eg:
            # predictionFreqMap = { 
            #   '123e4567-e89b-12d3-a456-426614174001' : [ 0.64, 0.75, 0.2 ],
            #   '123e4567-e89b-12d3-a456-426614174002' : [ 0.95, 0.32 ]  
            # }

            maxScoreHeap = []
            heapq.heapify(maxScoreHeap)

            for postId, probabilitiesList in predictionFreqMap.items():
                mean = np.mean(probabilitiesList)
                var = np.var(probabilitiesList) if (np.var(probabilitiesList) > 0) else 1
                freq = len(probabilitiesList)
                # multiply score by -1 beacause 
                # python only supports min heaps.
                # punish those lists with higher variability
                score = (-1 * freq * mean) / var
                heapq.heappush(maxScoreHeap, (score, postId))

            topKPostIds = [ ]
            # TODO: should find out which of the returned classes is seen most
            # frequently and with more probability.
            # Return top K from that
            for i in range(k):
                if len(maxScoreHeap) > 0:
                    topKPostIds.append(heapq.heappop(maxScoreHeap)[1])
           
            return topKPostIds
    except Exception as e:
        print(e)

try:
    databaseConnectionInfo = json.loads(sys.argv[1])
    exludedPhotoId = sys.argv[2]
    print("Output from Python: " + str(getTopKNearestNeighbours(databaseConnectionInfo, exludedPhotoId)))
    #exit()
except Exception as e:
    print(e)