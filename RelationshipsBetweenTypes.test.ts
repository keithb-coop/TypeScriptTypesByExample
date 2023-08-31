import exp from "constants";
import { Hash } from "crypto"

describe("Relationships between types",()=>{
    describe("Interfaces",()=>{
        describe("can extend one another", ()=> {
            it("in regard of fields, that is, object shape", () => {
                interface A {
                    aString: string
                } // explicitly, there exists a set of objects which have a string field, call it 'A'
                interface B extends A {
                    aNumber: number
                } // explicitly, there exists a subset of the set above which objects also have a number field, call it 'B'

                let anA: A
                let aB: B

                // both sets are, so far as we know, empty at this point

                anA = {aString: "hello"} // the object is a member of set A, it turns out
                // aB = anA doesn't compile; the object isn't a member of set B
                // anA = {aNumber: number} also doesn't compile; this object is not a member of set A

                aB = {aString: "hello", aNumber: 123} // this object is a member of set B
                anA = aB // and is also a member of set A

                expect(anA).toEqual(aB)

                const anObject = {aString: "hello", aNumber: 123, aBool: true}

                anA = anObject // this object is a member of set A
                aB = anObject // it's also a member of set B
                expect(anA).toEqual(aB) // we can refer to it either way.
                expect(anA).toEqual(anObject)
                expect(aB).toEqual(anObject)
            })
            it("in regard of methods, that is, object behaviour", () => {
                interface A {
                    stringToString(aString: string):string
                } // explicitly, there exists a set of objects which have a method taking strings, returning strings
                interface B extends A {
                    numberToNumber(aNumber: number):number
                } // explicitly, there exists a subset of the set above which objects also have a method taking numbers, returning numbers

                let anA: A
                let aB: B

                // both sets are, so far as we know, empty at this point

                anA = {
                    stringToString(aString: string): string {
                        return aString.toLocaleLowerCase()
                    }
                } // this object is a member of set A, it turns out
                // aB = anA doesn't compile, the object isn't a member of set B

                aB = {
                    stringToString(aString: string): string {
                        return aString.toLocaleLowerCase()
                    }, // classes are the answer to this duplication

                    numberToNumber(aNumber: number): number {
                        return aNumber % 10
                    }
                } // this object is a member of set B
                anA = aB // and is also a member of set A

                expect(anA).toEqual(aB)

                const anObject = {
                    stringToString(aString: string): string {
                        return aString.toLocaleLowerCase()
                    },

                    numberToNumber(aNumber: number): number {
                        return aNumber % 10
                    },

                    someOtherMethod(x:any):any{
                        return x
                    }
                }

                anA = anObject // this object is a member of set A
                aB = anObject // it's also a member of set B
                expect(anA).toEqual(aB) // we can refer to it either way.
                expect(anA).toEqual(anObject)
                expect(aB).toEqual(anObject)
            })
        })
    })
    describe("Classes",()=>{
        it("can extend another class",()=>{
            class A { // explicitly, a set of objects, A, of this shape exists,
                #aString: string

                constructor(aString: string) { // and here's how to make one
                    this.#aString = aString
                }
            }

            class B extends A { // explicitly, a set of object, B, of this shape, exists.
                // explicitly, B is a subset of A
                #aNumber:number

                constructor(aString: string, aNumber: number) { // and this is how to make one
                    super(aString) // which means also making an A.
                    this.#aNumber = aNumber
                }
            }
        })

        it("can implement an interface, too", ()=>{

            interface HasString {
                someString :string
            }

            class A {
                set aString(value: string) {
                    this._aString = value
                }
                get aString(): string {
                    return this._aString
                }
                private _aString: string

                constructor(aString: string) {
                    this._aString = aString
                }
            }

            class B extends A implements HasString{
                #aNumber:number

                constructor(aString: string, aNumber: number) {
                    super(aString)
                    this.#aNumber = aNumber
                }

                get someString(): string { // this getter/setter property satisfies the interface, but is backed by the parent class property
                    return this.aString
                }

                set someString(value: string) {
                    this.aString = value
                }
            }

            const b : B = new B("the string", 123)
            const a = b
            const stringHaver : HasString = b
            expect(b.someString).toEqual(a.aString)
            expect(b.someString).toEqual(stringHaver.someString)
        })
    })
})


