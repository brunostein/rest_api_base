/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const { body, validationResult } = require('express-validator');
const ApiSettingsModel = require("../models/api/api_settings.model");
const apiHelper = require('../helpers/api');

const validators = {
  update: () => {
    return [
      body('companySupportEmail', 'Invalid companySupportEmail').isEmail().optional(),
      body('tokenAuthScheme', 'Invalid tokenAuthScheme. The JWT or BEARER type is required.').matches(/(JWT|BEARER)/i).optional(),
      body('accessTokenExpiresIn', 'Invalid accessTokenExpiresIn.').matches(/\d+(m|h|d|y)/).optional(),
      body('refreshTokenExpiresIn', 'Invalid refreshTokenExpiresIn.').matches(/\d+(m|h|d|y)/).optional(),
      body('storeAccessesHistoryEnabled', 'Invalid storeAccessesHistoryEnabled.').matches(/(on|off)/).optional(),
      body('swaggerHost', 'Invalid swaggerHost.').matches(/(http|https):\/\/.*/).optional(),
      body('swaggerPort', 'Invalid swaggerPort.').isInt().optional()
    ];
  }
};

const ApiSettingsController = {

  get: (req, res) => {
    try {
      apiHelper.checkSystemScope(req).then((isSystemScope) => {
        if (!isSystemScope) {
          return res.status(201).send({ success: false, msg: "Permission denied." });
        }

        ApiSettingsModel.findOne().then(apiSettings => {
          return res.status(201).send({ success: true, data: apiSettings });
        })
      });
    } catch (err) {
      consoleLog(err);
      return res.status(500).send({ success: false, msg: "Couldn't get the Api Settings." });
    }
  },

  update: [
    validators.update(),
    async (req, res) => {
      try {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(201).send({ success: false, errors: errors.array()})
        }

        apiHelper.checkSystemScope(req).then(async (isSystemScope) => {
          if (!isSystemScope) {
            return res.status(201).send({success: false, msg: "Permission denied." });
          }

          let data = req.body;
          let apiSettingsData = await ApiSettingsModel.findOne();
          let apiSettingsDataOrig = {...apiSettingsData};

          // API SETTING
          if (data.companyName) {
            apiSettingsData.companyName = data.companyName;
          }
          if (data.companyWebsite) {
            apiSettingsData.companyWebsite = data.companyWebsite;
          }
          if (data.companySupportEmail) {
            apiSettingsData.companySupportEmail = data.companySupportEmail;
          }
          if (data.name) {
            apiSettingsData.name = data.name;
          }
          if (data.descr) {
            apiSettingsData.descr = data.descr;
          }
          if (data.tokenAuthScheme) {
            apiSettingsData.tokenAuthScheme = data.tokenAuthScheme;
          }
          if (data.accessTokenSecret) {
            apiSettingsData.accessTokenSecret = data.accessTokenSecret;
          }
          if (data.accessTokenExpiresIn) {
            apiSettingsData.accessTokenExpiresIn = data.accessTokenExpiresIn;
          }
          if (data.refreshTokenEnabled) {
            apiSettingsData.refreshTokenEnabled = data.refreshTokenEnabled;
          }
          if (data.refreshTokenSecret) {
            apiSettingsData.refreshTokenSecret = data.refreshTokenSecret;
          }
          if (data.refreshTokenExpiresIn) {
            apiSettingsData.refreshTokenExpiresIn = data.refreshTokenExpiresIn;
          }
          if (data.storeAccessesHistoryEnabled) {
            apiSettingsData.storeAccessesHistoryEnabled = data.storeAccessesHistoryEnabled;
          }

          // SWAGGER SETTING
          if (data.swaggerHost) {
            apiSettingsData.swaggerHost = data.swaggerHost;
          }
          if (data.swaggerPort) {
            apiSettingsData.swaggerPort = data.swaggerPort;
          }
          if (data.swaggerPath) {
            apiSettingsData.swaggerPath = data.swaggerPath;
          }

          // CACHE SETTINGS
          if (data.cacheEnabled) {
            apiSettingsData.cache.enabled = data.cacheEnabled;
          }
          if (data.cachePrefix) {
            apiSettingsData.cache.prefix = data.cachePrefix;
          }
          if (data.cacheType) {
            apiSettingsData.cache.type = data.cacheType;
          }
          if (data.cacheRedisHost) {
            apiSettingsData.cache.redis.host = data.cacheRedisHost;
          }
          if (data.cacheRedisPort) {
            apiSettingsData.cache.redis.port = data.cacheRedisPort;
          }
          if (data.cacheRedisPass) {
            apiSettingsData.cache.redis.pass = data.cacheRedisPass;
          }
          if (data.cacheRedisDefaultExpirationTime) {
            apiSettingsData.cache.redis.defaultExpirationTime = data.cacheRedisDefaultExpirationTime;
          }
          if (data.cacheRedisRandomExpiration) {
            apiSettingsData.cache.redis.randomExpiration = data.cacheRedisRandomExpiration;
          }
          if (data.cacheRedisRandomExpirationMinNumber) {
            apiSettingsData.cache.redis.randomExpirationMinNumber = data.cacheRedisRandomExpirationMinNumber;
          }
          if (data.cacheRedisRandomExpirationMaxNumber) {
            apiSettingsData.cache.redis.randomExpirationMaxNumber = data.cacheRedisRandomExpirationMaxNumber;
          }

          if (JSON.stringify(apiSettingsDataOrig) !== JSON.stringify(apiSettingsData)) {
            // Need Reboot after update
            apiSettingsData.needReboot = true;

            ApiSettingsModel.findOneAndUpdate({}, apiSettingsData, { returnOriginal: false }).then(newApiSettings => {
              if (newApiSettings === null) {
                return res.status(201).send({ success: false,  msg: "Couldn't get the Api Settings." });
              }

              return res.status(201).send({ success: true, data: newApiSettings, msg: "Api Settings updated successfully. It is necessary restart the API for the changes to take effect."  });
            });
          } else {
            return res.status(201).send({ success: false, data: apiSettingsDataOrig, msg: "No changes to apply."  });
          }
        });
      } catch (err) {
        consoleLog(err);
        return res.status(500).send({ success: false, msg: "Couldn't update the Api Settings." });
      }
    }
  ]
}

module.exports = ApiSettingsController;
