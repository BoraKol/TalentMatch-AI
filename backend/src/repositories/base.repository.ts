import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from './interfaces/repository.interface';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    private _model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this._model = schemaModel;
    }

    async create(item: Partial<T>): Promise<T> {
        return await this._model.create(item);
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

    async find(filter: FilterQuery<T>): Promise<T[]> {
        return await this._model.find(filter).exec();
    }

    async findOne(id: string): Promise<T | null> {
        return await this._model.findById(id).exec();
    }

    async findOneByFilter(filter: FilterQuery<T>): Promise<T | null> {
        return await this._model.findOne(filter).exec();
    }

    async count(filter: FilterQuery<T>): Promise<number> {
        return await this._model.countDocuments(filter).exec();
    }
}

