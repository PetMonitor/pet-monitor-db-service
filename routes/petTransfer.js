var express = require("express");

const fs = require('fs');
const path = require('path');
var http = require("http-status-codes");
var uuid = require("uuid");

const db = require("../models/index.js");
const logger = require("../utils/logger.js");
const emails = require("../utils/emails.js");
const translations = require("../utils/translations.js");

var router = express.Router({ mergeParams: true });

const port = process.env.PORT || "8000";

const TRANSFER_ACCEPTANCE_PERIOD_DAYS = 15;
const EXPO_METRO_SERVER_URI =
  process.env.EXPO_METRO_SERVER_URI || "http://127.0.0.1:19000";
const TRANSFER_BASE_URL = `http://localhost:${port}/pets/`;
const PET_TRANSFER_ERROR_HTML_PATH = path.resolve(__dirname, '../static/petTransferedErrorView.html');
const PET_TRANSFER_SUCCESS_HTML_PATH = path.resolve(__dirname, '../static/petTransferedView.html');

router.get("/", async (req, res) => {
  try {
    logger.info(`Fetching active pet transfer for pet ${req.params.petId}`);

    const transfer = await db.PetTransfers.findOne({
      where: {
        petId: req.params.petId,
        cancelled: false,
        activeUntil: {
          [Op.lte]: new Date(),
        },
      },
    });

    logger.info(`Obtained transfer ${JSON.stringify(transfer)}`);

    if (transfer == null) {
      return res.status(http.StatusCodes.NOT_FOUND);
    }

    return res.status(http.StatusCodes.OK).json(transfer);
  } catch (err) {
    logger.error(err);
    return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({
      error:
        http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) +
        " " +
        err,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const petInfo = await db.Pets.findOne({
      where: { uuid: req.params.petId },
    });

    var activeUntil = new Date();

    const transfer = await db.PetTransfers.create({
      uuid: req.body.uuid,
      _ref: req.body._ref,
      petId: req.params.petId,
      transferFromUser: petInfo.userId,
      transferToUser: req.body.transferToUser,
      activeFrom: new Date(),
      activeUntil: activeUntil.setDate(
        activeUntil.getDate() + TRANSFER_ACCEPTANCE_PERIOD_DAYS
      ),
      cancelled: false,
      completedOn: null,
    });

    logger.info(`Created transfer ${JSON.stringify(transfer)}`);

    const recipientInfo = await db.Users.findOne({
      where: { uuid: req.body.transferToUser },
    });

    // Notify user
    const deeplinkBaseUri = `exp://${EXPO_METRO_SERVER_URI}/--/users`;
    const deeplink =
      deeplinkBaseUri + `/${petInfo.userId}/pets/${petInfo.uuid}`;
    const acceptTransferLink =
      TRANSFER_BASE_URL + petInfo.uuid + "/transfer/accept/" + transfer.uuid;

    const petName = petInfo.name.length > 0 ? petInfo.name : "-";
    const petFurColor = petInfo.furColor.length > 0 ? petInfo.furColor : "-";
    const endDate = activeUntil.toISOString().split(".")[0].replace("T", " ");

    const replacements = {
      username: recipientInfo.username,
      title: `NUEVA TRANSFERENCIA: ${
        translations.petTranslationMatcher[petInfo.type].translation
      }`,
      petName: petName,
      petFurColor: petFurColor,
      petSex: translations.petTranslationMatcher[petInfo.sex].translation,
      petSize: translations.petTranslationMatcher[petInfo.size].translation,
      petLifeStage:
        translations.petTranslationMatcher[petInfo.lifeStage].translation,
      description: petInfo.description,
      endDate: endDate,
      deeplink: deeplink,
      acceptLink: acceptTransferLink,
    };

    logger.info(`Replacements ${JSON.stringify(replacements)}`);

    emails.sendEmail(
      recipientInfo.email,
      "Pet Monitor: transferencia de mascota iniciada!",
      "../static/requestPetTransferEmailTemplate.html",
      {
        ...replacements,
      },
      [translations.petTranslationMatcher[petInfo.type].icon]
    );
    return res.status(http.StatusCodes.CREATED).json(transfer);
  } catch (err) {
    logger.error(err);
    return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({
      error:
        http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) +
        " " +
        err,
    });
  }
});

router.get("/accept/:transferId", async (req, res) => {
  const tx = await db.sequelize.transaction();
  // TODO: replace errors with error screens and success with success screen
  try {
    const transferInfo = await db.PetTransfers.findOne({
      where: { uuid: req.params.transferId },
    });

    const user = await db.Users.findOne({
        where: { uuid: transferInfo.transferToUser }
    })

    if (transferInfo == null || user == null) {
      const errorMsg = `No transfer found for id ${req.params.transferId}`;
      emails.replaceInHtml(PET_TRANSFER_ERROR_HTML_PATH, { errorDescription: errorMsg })  
      logger.error(errorMsg);
      return res.status(http.StatusCodes.BAD_REQUEST).send(transferFailedView);
    }

    logger.info(
        `Transfer info ${JSON.stringify(transferInfo)}.`
    );

    if (transferInfo.cancelled) {
      const errorMsg = `Pet transfer ${transferInfo.uuid} cannot be completed because it was cancelled.`
      logger.error(errorMsg);
      emails.replaceInHtml(PET_TRANSFER_ERROR_HTML_PATH, { errorDescription: errorMsg })  
      return res.status(http.StatusCodes.BAD_REQUEST).send(transferFailedView);
    }

    if (transferInfo.completedOn != null) {
      const errorMsg = `Pet transfer ${transferInfo.uuid} has already been completed.`
      logger.error(errorMsg);
      emails.replaceInHtml(PET_TRANSFER_ERROR_HTML_PATH, { errorDescription: errorMsg })  
      return res.status(http.StatusCodes.BAD_REQUEST).send(transferFailedView);
    }

    if (transferInfo.activeUntil < new Date()) {
      const errorMsg = `Attempted to accept pet transfer ${transferInfo.uuid}, but transfer is no longer active.`;
      logger.error(errorMsg);
      emails.replaceInHtml(PET_TRANSFER_ERROR_HTML_PATH, { errorDescription: errorMsg })  
      return res.status(http.StatusCodes.BAD_REQUEST).send(transferFailedView);
    }

    await db.Pets.update(
      { userId: transferInfo.transferToUser },
      { where: { uuid: transferInfo.petId } },
      { transaction: tx }
    );

    await db.Notices.update(
      { userId: transferInfo.transferToUser },
      { where: { petId: transferInfo.petId } },
      { transaction: tx }
    );

    await db.PetTransfers.update(
      { completedOn: new Date() },
      { where: { uuid: transferInfo.uuid } },
      { transaction: tx }
    );

    // TODO: notify transfer completed
    // Update current pet history    

    const lastHistory = await db.PetsFosterHistory.findOne(
        {
          where: {
            petId: transferInfo.petId,
            userId: transferInfo.transferFromUser,
            untilDate: null
          },
          order: [
            ['sinceDate', 'DESC']
          ]
        },

        { transaction: tx }
    )

    if (lastHistory != null) {
        await db.PetsFosterHistory.update(
            {
              updatedAt: new Date(),
              untilDate: new Date(),
            },
            {
              where: {
                uuid: lastHistory.uuid,
              },
            },
            { transaction: tx }
        );
    }

    // Create new history entry for pet
    await db.PetsFosterHistory.create(
      {
        uuid: uuid.v4(),
        _ref: uuid.v4(),
        petId: transferInfo.petId,
        userId: transferInfo.transferToUser,
        contactEmail: user.email,
        contactPhone: user.phoneNumber,
        contactName: user.name,
        sinceDate: new Date(),
        untilDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { transaction: tx }
    );

    await tx.commit();

    logger.info(`Successfully pet transfer ${transferInfo.uuid}`);
    return res.status(http.StatusCodes.CREATED).send(fs.readFileSync(PET_TRANSFER_SUCCESS_HTML_PATH, 'utf8'));
  } catch (err) {
    await tx.rollback();
    logger.error(err);
    return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({
      error:
        http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) +
        " " +
        err,
    });
  }
});

router.post("/cancel/:transferId", async (req, res) => {
  try {
    const affectedRows = await db.PetTransfers.update(
      { cancelled: true },
      { where: { petId: req.params.petId, uuid: req.params.transferId } }
    );
    return res
      .status(http.StatusCodes.CREATED)
      .json({ updatedCount: affectedRows[0] });
  } catch (err) {
    logger.error(err);
    return res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({
      error:
        http.getReasonPhrase(http.StatusCodes.INTERNAL_SERVER_ERROR) +
        " " +
        err,
    });
  }
});

module.exports = router;
