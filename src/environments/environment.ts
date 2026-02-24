import preProdEnvironment from './environment.preproduction';
import productionEnvironment from './environment.prod';

const environment: any = (() => {
  switch (import.meta.env.VITE_MODE) {
    case 'preproduction':
      return preProdEnvironment;
    case 'prod':
      return productionEnvironment;
    default:
      return preProdEnvironment;
  }
})();

export default environment;
