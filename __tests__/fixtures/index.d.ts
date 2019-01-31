declare const obj: {
    test: number;
    aaaa: string;

    /**
    * 666
    * @param {String} bbb asd
    */
    getFn(bbb: string): Promise<{
        test: number;
        aaaa: string;

        /**
        * 666
        * @param {String} bbb asd
        */
        getFn(bbb: string): Promise<any>;
        bbb(): Promise<{
            test: number;
            aaaa: string;

            /**
            * 666
            * @param {String} bbb asd
            */
            getFn(bbb: string): Promise<any>;
            bbb(): Promise<any>;
        }>;
    }>;
    bbb(): Promise<any>;
};
export = obj;
