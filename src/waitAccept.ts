import {StrategyOptions} from '../types/index';

const options: StrategyOptions = {
    shouldAcceptIncomingResponse() {
        return false;
    },
    shouldUseIncomingResponse(previous) {
        /* istanbul ignore next 这个策略永远用不到这方法 */
        return true;
    },
};

export default options;
