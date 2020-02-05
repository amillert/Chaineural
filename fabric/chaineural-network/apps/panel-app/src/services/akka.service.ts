const axios = require("axios");
import * as helper from '../libs/helper';

const logger = helper.getLogger('Akka.Service');
export async function startLearning(transaction: string, epochsCount: string, workersAmount: string, synchronizationHyperparameter: string, featuresSize: string, hiddenSize: string, outputSize: string, ETA: string) {
  logger.info('start learning function')
  const url = "http://169.254.76.230:8080/hyper";

  const startAkka = async url => {
    // return 'OK'
    try {
      let body = {
        "amountOfWorkers": +workersAmount,
        "synchronizationHyperparameter": +synchronizationHyperparameter,
        "featuresSize": +featuresSize,
        "hiddenSize": +hiddenSize,
        "outputSize": +outputSize,
        "epochs": +epochsCount,
        "eta": +ETA
      };
      console.log('body')
      console.log(body)
      const response = await axios.post(url, body);
      logger.info('start learning response')
      if(response.statusText = 201) return 'OK'
      return 'FAILED';
    } catch (error) {
      logger.error('start learning function error')
      logger.error(error)
      return 'FAILED'
    }
  };
  return startAkka(url);
}

export async function getMinibatchAmount(minibatchSize: string) {
  logger.info('get  minibatches function')
  const url = "http://169.254.76.230:8080/amountOfMiniBatches/" + minibatchSize;
  console.log(url)
  // return '136'
  const startAkka = async url => {
    try {
      const response = await axios.get(url);
      logger.info('getMinibatchAmount response')
      console.log(response.data);
      return response.data.toString();
    } catch (error) {
      logger.error('getMinibatchAmount error')
      logger.error(error)
      return 'FAILED'
    }
  };
  return startAkka(url);
}

