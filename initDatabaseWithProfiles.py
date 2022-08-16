import os
import csv
import requests
import uuid
import base64

PET_NOTICES_PATH = 'NOTICES.csv'
PET_PROFILES_PATH = 'DOG_PROFILES.csv'
USER_PROFILES_PATH = 'USER_PROFILES.csv'
FOSTERING_PROFILES_PATH = 'FOSTER_VOLUNTEER_PROFILES.csv'
PET_FOSTER_HISTORY_PATH = 'PET_FOSTER_HISTORY.csv'
DOG_PICTURES_DIR = 'dogs_profiles'
TEST_SPLIT = 0.3
LIMIT_FOUND_PETS = 3
IMG_FILE_EXTENSIONS = (".png",".jpg")

SUCCESS_CASES_IDS = [ 1, 3, 9, 11, 12, 19, 22, 23, 28, 30 ]
DB_SERVICE_URL = os.getenv('DB_SERVICE', 'http://localhost:8000')

pets = {}


def getImgFilesFromPath(path):
    filesList = []
    for photoFile in os.listdir(path):
        if photoFile.endswith(IMG_FILE_EXTENSIONS) and os.path.isfile(os.path.join(path, photoFile)):
            filesList.append(os.path.join(path, photoFile))
    return filesList


def initDatabase():

    actionMapper = {
        'LOST AND FOUND': lambda r: createLostAndFoundNotices(r),
        'FOUND': lambda r: createFoundNotice(r),
        'LOST': lambda r: createLostNotice(r),
        'FOR_ADOPTION': lambda r: createFoundNotice(r, isInAdoption=True),
        'STOLEN': lambda r: createLostNotice(r, isStolen=True),
    }

    with open(USER_PROFILES_PATH, 'r') as userProfilesCsv:
        csvUserProfilesReader = csv.DictReader(userProfilesCsv)
        # Make requests to create user profiles.
        # Load user ids to dictionary for later use.
        for row in csvUserProfilesReader:
            # print("Processing USERS row {}".format(str(row)))

            requests.post(DB_SERVICE_URL + '/users', json={
                "uuid": row['uuid'],
                "_ref": row['_ref'],
                "username": row['username'],
                "password": row['password'],
                "email": row['email'],
                "name": row['name'],
                "phoneNumber": row['phoneNumber'],
                "facebookId": row['facebookId'],
                "profilePicture": None if row['profilePicture'] == "null" else row['profilePicture'],
                "alertsActivated": bool(row['alertsActivated']),
                "alertsForReportTypes": "",
                "pets": []
            })

    with open(PET_PROFILES_PATH, 'r') as petProfilesCsv:
        csvPetProfilesReader = csv.DictReader(petProfilesCsv)
        for row in csvPetProfilesReader:
            # print("Processing PETS row {}".format(str(row)))

            pets[row['uuid']] = {
                "userId": row['userId'],
                "_ref": row['_ref'],
                "type": row['type'],
                "name": row['name'],
                "sex": row['sex'],
                "datasetId": row['datasetId'],
                "furColor": row['furColor'],
                "breed": row['breed'],
                "size": row['size'],
                "lifeStage": row['lifeStage'],
                "description": row['description'],
                "age": row['age']
            }

    # print("Pets map {}".format(str(pets)))
    print("Now create notices...")

    with open(PET_NOTICES_PATH, 'r') as petNoticesCsv:
        csvPetNoticesReader = csv.DictReader(petNoticesCsv)

        for row in csvPetNoticesReader:
            #print("Processing NOTICES row {}".format(str(row)))

            actionMapper[row['noticeType']](row)


    with open(FOSTERING_PROFILES_PATH, 'r') as fosteringProfilesCsv:
        csvFosteringProfilesCsv = csv.DictReader(fosteringProfilesCsv)
        # Make requests to create foster volunteer profiles.
        for row in csvFosteringProfilesCsv:

            requests.post(DB_SERVICE_URL + '/fosterVolunteerProfiles', json={
                "uuid": row['uuid'],
                "_ref": row['_ref'],
                "userId": row['userId'],
                "petTypesToFoster": row['petTypesToFoster'].split(","),
                "petSizesToFoster": row['petSizesToFoster'].split(","),
                "province": row['province'],
                "location": row['location'],
                "additionalInformation": row['additionalInformation'],
                "available": row['available'],
                "averageRating": row['averageRating'],
                "ratingAmount": row['ratingAmount'],
            })


    with open(PET_FOSTER_HISTORY_PATH, 'r') as fosteringHistoryCsv:
        csvFosteringHistoryCsv = csv.DictReader(fosteringHistoryCsv)
        # Make requests to create fostering history entries.
        for row in csvFosteringHistoryCsv:
            print("Processing FOSTER HISTORY row {}".format(str(row)))

            requests.post(DB_SERVICE_URL + '/pets/' + row["petId"] + '/fosterHistory', json={
                "uuid": row['uuid'],
                "_ref": row['_ref'],
                "userId": None if row['userId'] == "null" else row['userId'],
                "contactEmail": None if row['contactEmail'] == "null" else row['contactEmail'],
                "contactPhone": None if row['contactPhone'] == "null" else row['contactPhone'],
                "contactName": None if row['contactName'] == "null" else row['contactName'],
                "sinceDate": row['sinceDate'],
                "untilDate": None if row['untilDate'] == "null" else row['untilDate'],
            })


def createFoundNotice(row, isInAdoption = False, photos = []):
    # Find assigned userId for pet in PET_PROFILES_PATH file.
    # Create pet profile associated to that userId, 
    # DO NOT include 'name' or 'age' attributes. 

    pet = pets[row['petId']]
    userId = pet['userId']

    if (len(photos) == 0):
        petPhotosDir = DOG_PICTURES_DIR + '/' + pet['datasetId']
        photos = getImgFilesFromPath(petPhotosDir)

    print("Creating FOUND pet {} with photos {}".format(str(row['petId']), str(photos)))

    requests.post(DB_SERVICE_URL + '/users/' + userId + '/pets', json={
        "uuid": row['petId'],
        "_ref": pet['_ref'],
        "type": pet['type'],
        "sex": pet['sex'],
        "furColor": pet['furColor'],
        "breed": pet['breed'],
        "size": pet['size'],
        "lifeStage": pet['lifeStage'],
        "description": pet['description'],
        "photos": imagesToBase64(photos)
    })

    # Create FOUND notice for pet.

    requests.post(DB_SERVICE_URL + '/users/' + userId + '/notices', json={
        "uuid": row['uuid'],
        "_ref": row['_ref'],
        "petId": row['petId'],
        "noticeType": "FOR_ADOPTION" if isInAdoption else "FOUND",
        "street": row['street'],
        "neighbourhood": row['neighbourhood'],
        "locality": row['locality'],
        "country": row['country'],
        "eventLocationLat": row['latitude'],
        "eventLocationLong": row['longitude'],
        "description": row['description'],
        "eventTimestamp":row['eventTimestamp'],
    })

    return


def createLostNotice(row, isStolen = False, photos = []):
    # Use assigned userId for pet (from PET_PROFILES_PATH file).
    # Create pet profile associated to that userId, INCLUDE FULL set of attributes. 
    pet = pets[row['petId']]
    userId = pet['userId']

    if (len(photos) == 0):
        petPhotosDir = DOG_PICTURES_DIR + '/' + pet['datasetId']
        photos = getImgFilesFromPath(petPhotosDir)

    print("Creating LOST pet {} with photos {}".format(str(row['petId']), str(photos)))

    requests.post(DB_SERVICE_URL + '/users/' + userId + '/pets', json={
        "uuid": row['petId'],
        "_ref": pet['_ref'],
        "type": pet['type'],
        "sex": pet['sex'],
        "furColor": pet['furColor'],
        "breed": pet['breed'],
        "name": pet['name'],
        "description": pet['description'],
        "age": pet['age'],
        "size": pet['size'],
        "lifeStage": pet['lifeStage'],
        "photos": imagesToBase64(photos)
    })

    # Create LOST notice for pet.

    requests.post(DB_SERVICE_URL + '/users/' + userId + '/notices', json={
        "uuid": row['uuid'],
        "_ref": row['_ref'],
        "petId": row['petId'],
        "noticeType": "STOLEN" if isStolen else "LOST",
        "street": row['street'],
        "neighbourhood": row['neighbourhood'],
        "locality": row['locality'],
        "country": row['country'],
        "eventLocationLat": row['latitude'],
        "eventLocationLong": row['longitude'],
        "description": row['description'],
        "eventTimestamp":row['eventTimestamp'],
    })

    return


def imagesToBase64(photoFiles):
    encodedImages = []
    for photoFile in photoFiles:
        with open(photoFile, "rb") as image_file:
            encodedImages.append({
                "uuid": str(uuid.uuid4()),
                "photo": base64.b64encode(image_file.read()).decode("utf-8")
            })
    return encodedImages


def createLostAndFoundNotices(row, isStolen = False):
    # Find assigned userId for pet in PET_PROFILES_PATH file.
    # Create pet profile associated to that userId using ONLY SOME 
    # of the available images from the dataset. Include 'name' attribute. 
    # Create LOST notice for pet.

    pet = pets[row['petId']]
    userIdFound = row['userIdFound']
    petIdFound = row['petIdFound']

    petPhotosDir = DOG_PICTURES_DIR + '/' + pet['datasetId']
    photos = getImgFilesFromPath(petPhotosDir)

    lenPhotosTest = len(photos) // 2 if int(TEST_SPLIT*len(photos)) <= 0 else int(TEST_SPLIT*len(photos))
    lenPhotosTrain = len(photos) - lenPhotosTest

    photosLost = photos[0:lenPhotosTrain]
    photosFound = photos[lenPhotosTrain:]

    # If 'userIdFound' specified, use that one, otherwise, pick one at random.
    # Create pet profile associated to that userId using ONLY SOME 
    # of the available images from the dataset. If 'petIdFound' specified, 
    # use that one, otherwise, pick one at random. DO NOT include 'name' attribute. 
    # Create FOUND notice for pet.

    if (len(userIdFound) <= 0 or len(petIdFound) <= 0):
        raise ValueError('userIdFound and petIdFound for FOUND should be provided! Received {} and {} respectively.'.format(row['userIdFound'], row['petIdFound']))

    if (userIdFound == pet['userId']):
        raise ValueError('User id for LOST and FOUND should be different! Received {} for both'.format(pet['userIdFound']))

    if (row['petId'] == petIdFound):
        raise ValueError('Pet id for LOST and FOUND should be different! Received {} for both'.format(pet['petIdFound']))


    print("Creating LOST AND FOUND NOTICES FOR pet id {} - found id {} - user id {} - user id found {}".format(row['petId'], petIdFound, pet['userId'], userIdFound))

    createLostNotice(row, isStolen, photosLost) # TODO: select photos, modify function createLostNotice to pick those

    print("Creating FOUND pet {} with photos {}".format(str(row['petId']), str(photosFound)))

    requests.post(DB_SERVICE_URL + '/users/' + userIdFound + '/pets', json={
        "uuid": petIdFound,
        "_ref": str(uuid.uuid4()),
        "type": pet['type'],
        "sex": pet['sex'],
        "furColor": pet['furColor'],
        "breed": pet['breed'],
        "description": pet['description'],
        "size": pet['size'],
        "lifeStage": pet['lifeStage'],
        "photos": imagesToBase64(photosFound),  #TODO: load photos
    })

    # Create LOST notice for pet.

    requests.post(DB_SERVICE_URL + '/users/' + userIdFound + '/notices', json={
        "uuid": str(uuid.uuid4()),
        "_ref": row['_ref'],
        "petId": petIdFound,
        "noticeType": "FOUND",
        "street": row['streetFound'],
        "neighbourhood": row['neighbourhood'],
        "locality": row['locality'],
        "country": row['country'],
        "eventLocationLat": row['latitudeFound'],
        "eventLocationLong": row['longitudeFound'],
        "description": row['description'],
        "eventTimestamp":row['eventTimestamp'],
    })
    return


initDatabase()
