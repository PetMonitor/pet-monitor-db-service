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


def getTopKNearestNeighbours(dbConnInfo, noticeId, region, k=15):
    labelEncoder = LabelEncoder()
    connString = "host={} port={} dbname={} user={} password={}".format(dbConnInfo['host'], dbConnInfo['port'], dbConnInfo['db'], dbConnInfo['username'], dbConnInfo['pwd'])
    conditionalRegionFilter = """AND (public."Notices".neighbourhood = '{}' OR public."Notices".locality = '{}' OR public."Notices".street = '{}' OR public."Notices".country = '{}')""".format(region, region, region, region) if region != '' else ''

    try:
        sqlCommandPetEmbeddings = """SELECT public."PetPhotos"."petId", public."Notices"."noticeType", embedding FROM "PetPhotos" INNER JOIN public."Notices" ON public."PetPhotos"."petId" = public."Notices"."petId" WHERE public."Notices"."uuid" = '{}' LIMIT 1""".format(noticeId)

        with psycopg2.connect(connString) as conn:
            # Select embeddings for searched pet
            searchedPetData = pd.read_sql(sqlCommandPetEmbeddings, conn)
            
            sqlCommandExcludePetEmbeddings = """SELECT public."Notices"."uuid", embedding FROM public."PetPhotos" INNER JOIN public."Notices" ON public."PetPhotos"."petId" = public."Notices"."petId" WHERE public."Notices"."uuid" != '{}' AND public."Notices"."noticeType" != '{}' {}""".format(noticeId, searchedPetData.iloc[0]['noticeType'], conditionalRegionFilter)

            # Select embeddings for all pets that aren't searched pet
            dataTrain = pd.read_sql(sqlCommandExcludePetEmbeddings, conn)

            if len(dataTrain) == 0:
                return { "foundPosts": [] }

            # Encode notice ids into numerical values
            noticeIdsSet = pd.unique(dataTrain.uuid.to_numpy())
            labelEncoder.fit(noticeIdsSet)
            numericPetIds = labelEncoder.transform(dataTrain.uuid.to_numpy())

            if len(noticeIdsSet) <= 1:
                return { "foundPosts": list(noticeIdsSet) }

            # train the classifier model
            model.fit(np.array(dataTrain.embedding.values.tolist()), numericPetIds)
            
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

            for noticeId, probabilitiesList in predictionFreqMap.items():
                mean = np.mean(probabilitiesList)
                var = np.var(probabilitiesList) if (np.var(probabilitiesList) > 0) else 1
                freq = len(probabilitiesList)
                # multiply score by -1 beacause 
                # python only supports min heaps.
                # punish those lists with higher variability
                score = (-1 * freq * mean) / var
                heapq.heappush(maxScoreHeap, (score, noticeId))

            topKNoticeIds = []
            # TODO: should find out which of the returned classes is seen most
            # frequently and with more probability.
            # Return top K from that
            for i in range(k):
                if len(maxScoreHeap) > 0:
                    topKNoticeIds.append(heapq.heappop(maxScoreHeap)[1])
            return { "foundPosts": topKNoticeIds }
    except Exception as e:
        print(e)

try:
    databaseConnectionInfo = json.loads(sys.argv[1])
    excludedPhotoId = sys.argv[2]
    region = sys.argv[4]
    print(str(getTopKNearestNeighbours(databaseConnectionInfo, excludedPhotoId, region)))
    #exit()
except Exception as e:
    print(e)
