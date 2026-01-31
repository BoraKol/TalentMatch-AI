import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseService<T extends Document> {
    constructor(private model: Model<T>) { }

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }

    async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
        return await this.model.find(filter).exec();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec();
    }

    async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id).exec();
    }
}
