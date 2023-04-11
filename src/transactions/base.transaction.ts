export interface Transaction {
    commit(args: any): Promise<any>;

    onCommitFail(args: any): Promise<any>;

    compensate(args: any): Promise<any>;
}
