import { CompensationRule } from "../transaction.executor";
import { Transaction } from "./base.transaction";

export class ActionThreeTransaction implements Transaction {

    commit(args: any): Promise<any> {
        console.log('commit action 3');
        return Promise.resolve();
    }
    
    onCommitFail(args: any): Promise<any> {
        console.log('commit fail on action 3');
        return Promise.resolve(CompensationRule.COMPENSATE);
    }

    compensate(args: any): Promise<any> {
        console.log('compensate action 3');
        return Promise.resolve();
    }

    toString() {
        return ActionThreeTransaction.name;
    }
}