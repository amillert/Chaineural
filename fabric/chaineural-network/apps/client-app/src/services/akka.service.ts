const axios = require("axios");
import * as helper from '../libs/helper';

const logger = helper.getLogger('Akka.Service');
export async function startLearning(initEpochsLedgerInJSON: string) {
  logger.info('start learning function')
  const url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
  const getData = async url => {
    try {
      const response = await axios.get(url);
      logger.info('start learning response')
      return response.statusText; 
    } catch (error) {
      logger.error('start learning function error')
      logger.error(error)
      return 'FAILED'
    }
  };
  return getData(url);
}

