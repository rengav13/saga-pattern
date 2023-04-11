import { Transaction } from "./transactions/base.transaction";
import { ActionTwoTransaction } from "./transactions/action-two.transaction";
import { ActionThreeTransaction } from "./transactions/action-three.transaction";
import { ActionOneTransaction } from "./transactions/action-one.transaction";
import { TransactionExecutor } from "./transaction.executor";

async function main() {
    const context: any = 'dummy context';

    const transactions: Transaction[] = [
        new ActionOneTransaction(),
        new ActionTwoTransaction(),
        new ActionThreeTransaction()
    ];
    
    const transaction = new TransactionExecutor(transactions);

    const results = await transaction.commit(context);

    console.log(results);
    results.filter(r => r.compensations).forEach(r => console.log(r.operation, r.compensations));
}

main();