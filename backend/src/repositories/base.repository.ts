import mongoose, { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export interface IRead<T> {
    find(item: FilterQuery<T>): Promise<T[]>;
    findOne(id: string): Promise<T | null>;
}

export interface IWrite<T> {
    create(item: T): Promise<T>;
    update(id: string, item: UpdateQuery<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T extends Document> implements IRead<T>, IWrite<T> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    async create(item: Partial<T>): Promise<T> {
        const createdItem = new this._model(item);
        return await createdItem.save();
    }

    async retrieve(): Promise<T[]> {
        return await this._model.find({}).exec();
    }

    async update(id: string, item: UpdateQuery<T>): Promise<T | null> {
        return await this._model.findByIdAndUpdate(id, item, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this._model.findByIdAndDelete(id).exec();
        return !!result;
    }

    async find(item: FilterQuery<T>): Promise<T[]> {
        return await this._model.find(item).exec();
    }

    async findOne(id: string): Promise<T | null> {
        return await this._model.findById(id).exec();
    }
}
