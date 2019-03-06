import {StrategyOptions} from '../types/index';

const options: StrategyOptions = {
    shouldAcceptIncomingResponse() {
        return true;
    },
    shouldUseIncomingResponse() {
        return false;
    },
};

export default options;
