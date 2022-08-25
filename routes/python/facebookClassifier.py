import sys
import heapq

import numpy as np
import psycopg2
import pandas as pd
import json

from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder


model = SVC(kernel='rbf', C=100.0, gamma='scale', probability=True)


def getTopKNearestNeighbours(dbConnInfo, postId, region, k=3):
    labelEncoder = LabelEncoder()
    connString = "host={} port={} dbname={} user={} password={}".format(dbConnInfo['host'], dbConnInfo['port'], dbConnInfo['db'], dbConnInfo['username'], dbConnInfo['pwd'])

    try:

        sqlCommandPetEmbeddings = """SELECT public."FacebookPosts"."postId", embedding, public."FacebookPosts"."noticeType" FROM public."FacebookPosts" INNER JOIN public."FacebookPostsEmbeddings" ON public."FacebookPosts"."uuid" = public."FacebookPostsEmbeddings"."postId" WHERE public."FacebookPosts"."postId" = '{}'""".format(postId)
        with psycopg2.connect(connString) as conn:

            # Select embeddings for searched pet
            searchedPetData = pd.read_sql(sqlCommandPetEmbeddings, conn)
            postType = searchedPetData.iloc[0]['noticeType']
            conditionalPostFilter = """AND public."FacebookPosts"."noticeType" != '{}'""".format(postType) if postType is not None else ''
            sqlCommandExcludePetEmbeddings = """SELECT public."FacebookPosts"."postId", embedding, location FROM public."FacebookPosts" INNER JOIN public."FacebookPostsEmbeddings" ON public."FacebookPosts"."uuid" = public."FacebookPostsEmbeddings"."postId" WHERE public."FacebookPosts"."postId" != '{}' {}""".format(postId, conditionalPostFilter)

            # Select embeddings for all pets that aren't searched pet
            dataTrain = pd.read_sql(sqlCommandExcludePetEmbeddings, conn)

            if len(dataTrain) == 0:
                return { "foundPosts": [], "foundPostsFromRegion": [] }

            # Encode post ids into numerical values
            dataTrainPostIds = dataTrain.postId.to_numpy()
            postIdsSet = pd.unique(dataTrainPostIds)
            if len(postIdsSet) <= 1:
                return { "foundPosts": postIdsSet, "foundPostsFromRegion": [] }

            labelEncoder.fit(postIdsSet)
            numericPostIds = labelEncoder.transform(dataTrainPostIds)

            trainingData = dataTrain.to_numpy()
            postsWithRegion = pd.unique(trainingData[trainingData[:, 2] == region][:, 0])
            numericRegionPostIds = labelEncoder.transform(postsWithRegion)

            # train the classifier model
            model.fit(np.array(dataTrain.embedding.values.tolist()), numericPostIds)

            # predict probabilities for each embedding
            probabilities = model.predict_proba(searchedPetData.embedding.values.tolist())
            # returns ordered predictions: from least to most probable
            orderedProbabilities = np.argsort(probabilities, axis=1)[:,::-1]

            topPredictionWithRegion = np.empty((orderedProbabilities.shape[0], min(k, numericRegionPostIds.shape[0])), dtype=object)
            topPredictionsWithoutRegion = np.empty((orderedProbabilities.shape[0], min(k, orderedProbabilities.shape[1])), dtype=object)
            if region != '' and len(numericRegionPostIds) > 0:
                for i in range(orderedProbabilities.shape[0]):
                    embeddingPredictions = orderedProbabilities[i]
                    topPredictionWithRegion[i] = embeddingPredictions[np.in1d(embeddingPredictions, numericRegionPostIds)][:k]
                    topPredictionsWithoutRegion[i] = embeddingPredictions[~np.in1d(embeddingPredictions, numericRegionPostIds)][:k]
            else:
                topPredictionsWithoutRegion = orderedProbabilities[:, :k]

            predictionFreqMap = getPredictioFreqMap(topPredictionsWithoutRegion, probabilities, labelEncoder)
            predictionFreqMapForRegion = getPredictioFreqMap(topPredictionWithRegion, probabilities, labelEncoder)

            return {
                "foundPosts": getTopKPostIds(predictionFreqMap, k),
                "foundPostsFromRegion": getTopKPostIds(predictionFreqMapForRegion, k)
            }

    except Exception as e:
        print(e)


def getPredictioFreqMap(topProbabilities, probabilities, labelEncoder):
    topPredictionLabels = np.empty(topProbabilities.shape, dtype=object)
    predictionFreqMap = {}

    for i in range(topProbabilities.shape[0]):
        # Predictions of one particular embedding. Each position represents a class,
        # ordered by highest probability
        embeddingPredictions = topProbabilities[i]
        # Save prediction labels for embedding i (pet ids)
        topPredictionLabels[i] = labelEncoder.inverse_transform(embeddingPredictions.astype(int))

        for j in range(topProbabilities.shape[1]):
            predictedClass = topPredictionLabels[i][j]
            if not predictedClass in predictionFreqMap:
                predictionFreqMap[predictedClass] = []
            # store probabilities (weights) for each predicted class
            predictionFreqMap[predictedClass].append(probabilities[i][topProbabilities[i][j]])

    # predictionFreqMap should map each predicted class (pet id) to an array with
    # all the probabilities predicted for that class (considering all embeddings).
    # The length of the list should give us the frequency of that prediction across
    # all embeddings, eg:
    # predictionFreqMap = {
    #   '123e4567-e89b-12d3-a456-426614174001' : [ 0.64, 0.75, 0.2 ],
    #   '123e4567-e89b-12d3-a456-426614174002' : [ 0.95, 0.32 ]
    # }
    return predictionFreqMap


def getTopKPostIds(predictionFreqMap, k):
    maxScoreHeap = []
    heapq.heapify(maxScoreHeap)

    for postId, probabilitiesList in predictionFreqMap.items():
        mean = np.mean(probabilitiesList)
        var = np.var(probabilitiesList) if (np.var(probabilitiesList) > 0) else 1
        freq = len(probabilitiesList)
        # multiply score by -1 because
        # python only supports min heaps.
        # punish those lists with higher variability
        score = (-1 * freq * mean) / var
        heapq.heappush(maxScoreHeap, (score, postId))

    topKPostIds = []
    # TODO: should find out which of the returned classes is seen most
    # frequently and with more probability.
    # Return top K from that
    for i in range(k):
        if len(maxScoreHeap) > 0:
            topKPostIds.append(heapq.heappop(maxScoreHeap)[1])

    return topKPostIds


try:
    databaseConnectionInfo = json.loads(sys.argv[1])
    excludedPhotoId = sys.argv[2]
    region = sys.argv[3]
    print(str(getTopKNearestNeighbours(databaseConnectionInfo, excludedPhotoId, region)))
    #exit()
except Exception as e:
    print(e)