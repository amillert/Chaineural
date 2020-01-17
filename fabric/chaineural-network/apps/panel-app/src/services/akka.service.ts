const axios = require("axios");
import * as helper from '../libs/helper';

const logger = helper.getLogger('Akka.Service');
export async function startLearning(transaction: string, minibatchSize: string, workersAmount: string, synchronizationHyperparameter: string, featuresSize: string, hiddenSize: string, outputSize: string, ETA: string) {
  logger.info('start learning function')
  const url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
  const startAkka = async url => {
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
  return startAkka(url);
}

export async function getMinibatchAmount(minibatchSize: string) {
  logger.info('start learning function')
  const url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
  const startAkka = async url => {
    try {
      const minibatchAmount = await axios.get(url);
      logger.info('getMinibatchAmount response')
      let mockResponse = 1000;
      return mockResponse.toString(); 
    } catch (error) {
      logger.error('getMinibatchAmount error')
      logger.error(error)
      return 'FAILED'
    }
  };
  return startAkka(url);
}

