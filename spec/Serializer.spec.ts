
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

import {Serializer} from '../src/Serializer';
import { ISerializable } from '../src/ISerializable';
import { TSerializable, TSerializables } from '../src/TSerializable';

describe('FuseSerializer', () => {
    let serializer: Serializer;
    let output: Blob | null;

    if (!Blob.prototype.text) {
        // polyfill the text API
        Blob.prototype.text = function(): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                const reader: FileReader = new FileReader();
                reader.onload = () => {
                    resolve(<string>reader.result);
                };
                reader.onerror = () => {
                    reject(reader.error);
                };
                reader.readAsText(this);
            });
        };
    }

    beforeEach(() => {
        serializer = new Serializer();
        output = null;
    });

    it('can serialize strings (passthrough)', async () => {
        output = serializer.serialize('passthrough');
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('passthrough');
    });

    it('can serialize booleans', async () => {
        output = serializer.serialize(true);
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('true');
    });

    it('can serialize numbers', async () => {
        output = serializer.serialize(1234.5);
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('1234.5');
    });

    it('can serialize Dates', async () => {
        output = serializer.serialize(new Date(0));
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('1970-01-01T00:00:00.000Z');
    });

    it('can serialize ISerializable', async () => {
        class MyObject implements ISerializable<string> {
            private $x: number;
            private $y: number;

            public constructor(x: number, y: number) {
                this.$x = x;
                this.$y = y;
            }

            public serialize(): string {
                return `${this.$x}, ${this.$y}`;
            }
        }
        
        const obj: MyObject = new MyObject(2, 3);

        output = serializer.serialize(obj);

        if (output === null) {
            fail('output not expected to be null');
        }

        expect(await output.text()).toBe('2, 3');
    });

    it('can serialize array of TSerializables', async () => {
        const x: TSerializables[] = ['test', 123, true];
        output = serializer.serialize(x);
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('["test",123,true]');
    });

    it('can serialize object of TSerializables', async () => {
        const x: TSerializables = {
            t1: 'test',
            t2: 123,
            t3: true
        };
        output = serializer.serialize(x);
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('{"t1":"test","t2":123,"t3":true}');
    });

    it('can serialize TSerializable', async () => {
        interface __MyInterface {
            t1: string;
            t2: number;
            t3: boolean;
        }

        type MyInterface = TSerializable<__MyInterface>;

        const x: MyInterface = {
            t1: 'test',
            t2: 123,
            t3: true
        };
        
        output = serializer.serialize(x);
        if (output === null) {
            fail('output not expected to be null');
        }
        expect(await output.text()).toBe('{"t1":"test","t2":123,"t3":true}');
    });
});
