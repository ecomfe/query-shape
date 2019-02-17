import createStrategy from './createStrategy';
import {StrategyOptions} from '../types/index';

const options: StrategyOptions = {
    shouldAcceptIncomingResponse() {
        return false;
    },
    /* istanbul ignore next 这个策略永远用不到这方法 */
    shouldUseIncomingResponse(previous) {
        return true;
    },
};

export default options;
