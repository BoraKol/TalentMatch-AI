import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from './interfaces/repository.interface';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(schemaModel: Model<T>) {
        this.model = schemaModel;
    }

    async create(item: Partial<T>): Promise<T> {
        return await this.model.create(item);
    }

    async retrieve(): Promise<T[]> {
        return await this.model.find({}).exec();
    }

    async update(id: string, item: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, item, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }

    async find(filter: FilterQuery<T>): Promise<T[]> {
        return await this.model.find(filter).exec();
    }

    async findOne(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }

    async findOneByFilter(filter: FilterQuery<T>): Promise<T | null> {
        return await this.model.findOne(filter).exec();
    }

    async count(filter: FilterQuery<T>): Promise<number> {
        return await this.model.countDocuments(filter).exec();
    }
}
