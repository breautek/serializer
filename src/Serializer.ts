
/*
Copyright 2023 Breautek

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ISerializable } from "./ISerializable";
import { TSerializables } from "./TSerializable";

/**
 * A class to serialize several different types of objects into a data structure
 */
export class Serializer {
    public constructor() {}

    protected _serializeToStringImpl(obj: TSerializables): string {
        if (typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'string') {
            return this._serializePrimitiveToString(obj);
        }
        else if (obj instanceof Date) {
            return this._serializeDateToString(obj);
        }
        else if (this._isISerializable(obj)) {
            return this._serializeToStringImpl(obj.serialize());
        }
        else if (obj instanceof Error) {
            return this._serializeErrorToString(obj);
        }

        // When all else fails, attempt to JSON stringify
        return JSON.stringify(obj);
    }

    protected _serializePrimitiveToString(obj: number | string | boolean): string {
        return obj.toString();
    }

    protected _serializeErrorToString(obj: Error): string {
        const serializedError = {
            name: obj.name,
            message: obj.message,
            stack: obj.stack
        };

        return JSON.stringify(serializedError, null, 4);
    }

    protected _serializeDateToString(obj: Date): string {
        return obj.toISOString();
    }

    /**
     * Serializes the given object into a blob.
     * 
     * @param obj - A supported serializable object. See {@link TSerializables} for
     * a list of currently supported types
     * @returns A serialized blob, or null if the given object can not be serialized
     */
    public serialize(obj: TSerializables): Blob | null {
        if (obj === null || obj === undefined) {
            return null;
        }

        let bin: Blob;
        if (obj instanceof Blob) {
            bin = obj;
        }
        else if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj instanceof Date) {
            bin = new Blob([this._serializeToStringImpl(obj)]);
        }
        else if (obj instanceof ArrayBuffer) {
            bin = new Blob([obj]);
        }
        else if (this._isISerializable(obj)) {
            let serialized: Blob | null = this.serialize(obj.serialize());
            if (serialized === null) {
                return null;
            }
            bin = new Blob([serialized]);
        }
        else {
            bin = new Blob([this._serializeToStringImpl(obj)]);
        }

        return bin;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected _isISerializable(x: any): x is ISerializable {
        return !!x.serialize && typeof x.serialize === 'function';
    }
}
