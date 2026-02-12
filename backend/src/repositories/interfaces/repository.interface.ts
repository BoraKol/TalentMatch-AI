import { FilterQuery, UpdateQuery } from 'mongoose';

export interface IRead<T> {
    find(filter: FilterQuery<T>): Promise<T[]>;
    findOne(id: string): Promise<T | null>;
    findOneByFilter(filter: FilterQuery<T>): Promise<T | null>;
}

export interface IWrite<T> {
    create(item: Partial<T>): Promise<T>;
    update(id: string, item: UpdateQuery<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

export interface IBaseRepository<T> extends IRead<T>, IWrite<T> {
    retrieve(): Promise<T[]>;
    count(filter: FilterQuery<T>): Promise<number>;
}
