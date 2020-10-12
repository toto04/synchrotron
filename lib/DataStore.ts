import LameStore from 'nedb'
import path from 'path'

export class DataStore<T> {
    lamestore: LameStore<T>
    constructor(filename: string) {
        this.lamestore = new LameStore<T>({
            filename: path.join(require.main?.path ?? __dirname, filename),
            autoload: true
        })
    }

    find = async (query: any): Promise<T[]> => new Promise((res, rej) => {
        this.lamestore.find(query, {}, (err, docs) => {
            if (err) rej(err)
            else res(docs)
        })
    })

    findOne = async (query: any): Promise<T | undefined> => new Promise((res, rej) => {
        this.lamestore.findOne(query, {}, (err, doc) => {
            if (err) rej(err)
            else res(doc)
        })
    })

    insert = async (query: any): Promise<T> => new Promise((res, rej) => {
        this.lamestore.insert(query, (err, doc) => {
            if (err) rej(err)
            else res(doc)
        })
    })

    update = async (query: any, updateQuery: any, options?: LameStore.UpdateOptions): Promise<number> => new Promise((res, rej) => {
        this.lamestore.update(query, updateQuery, options ?? {}, (err, numreplaced) => {
            if (err) rej(err)
            else res(numreplaced)
        })
    })
}