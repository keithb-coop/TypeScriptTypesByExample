import {isNumberObject} from "util/types";

describe("TypeScript types", () => {
    describe("Structural typing", () => {
        it("considers types to be compatible if they are the same shape", () => {
            interface A {
                aString: string
            }

            interface B {
                aString: string
            }

            // implicitly: there's a set of objects called A, and another set of objects called B, and they are the same set

            const anObject = {aString: "hello"}
            expect(typeof anObject).toEqual("object")

            const a: A = anObject // works fine
            const b: B = anObject // works fine

            // we refer to the object via references of two differently named yet compatible types
            expect(a).toEqual(b)
        })

        it("also considers types to be compatible if they overlap", () => {
            interface A {
                aString: string
            }

            interface B {
                aString: string
                aBool: boolean
            }

            // implicitly: there's a set of objects called A, and a set of objects called B, and B is a subset of A

            const anObject: B = {aString: "hello", aBool: true}
            // note that the following would not compile at this point, but the assignments to a and b would
            //const anObject: B = {aString: "hello", aBool: true, aNumber: 123}
            //the error is "Object literal may only specify known properties, and 'aNumber' does not exist in type 'B'."

            expect(typeof anObject).toEqual("object")
            // typescript doesn't know any more than this.

            const a: A = anObject // works fine
            const b: B = anObject // works fine

            // we refer to the object via references of two differently named, differently shaped, yet compatible types
            expect(a).toEqual(b)

            // the object can be bigger than both types
            const anotherObject = {aString: "hello", aBool: true, aNumber: 123} // note: no type
            const c: A = anotherObject // works fine
            const d: B = anotherObject // works fine

            // we refer to the object via references of two differently named, differently shaped, yet compatible types
            expect(c).toEqual(d)
        })

        it("it considers values of types that partially overlap to be consistend so long as they match both", () => {
            interface A {
                aString: string
                aNumber: number
            }

            interface B {
                aString: string
                aBool: boolean
            }

            // implicitly, there is a set of objects called A, and a set of objects called B and they are different, and they have a non-empty intersection

            const anObject = {aString: "hello", aBool: true, aNumber: 123}
            expect(typeof anObject).toEqual("object")
            // typescript doesn't know any more than this.

            const a: A = anObject // works fine
            const b: B = anObject // works fine

            // we refer to the object via references of two differently named, differently shaped, yet compatible types
            expect(a).toEqual(b)
        })

        it("it considers values of types that don't overlap to be consistend so long as they match both", () => {
            interface A {
                aNumber: number
            }

            interface B {
                aString: string
            }

            // implicitly, there is a set of objects called A, and a set of objects called B and they are different, and they have a non-empty intersection

            const anObject = {aString: "hello", aNumber: 123}
            expect(typeof anObject).toEqual("object")
            // typescript doesn't know any more than this.

            const a: A = anObject // works fine
            const b: B = anObject // works fine

            // we refer to the object via references of two differently named, differently shaped, yet compatible types
            expect(a).toEqual(b)
        })
    })

    describe("Type aliasing",()=>{
        describe ("Name a type, one perhaps otherwise anyonymous",()=>{
            it('comes from an object',()=> {
                const anObject = {aString: "hello"}

                // here typeof is an operator in an expression context
                expect(typeof anObject).toEqual("object")
                // typescript doesn't know any more than this.

                // here typeof is an operator in a type context
                const anotherObject: typeof anObject = {aString: "goodbye"}
                // this would not compile
                //     const yetAnotherObject: typeof anObject = {aNumber: 123}
                // the error is "Object literal may only specify known properties, and 'aNumber' does not exist in type '{ aString: string; }"

                expect(typeof anotherObject).toEqual("object")
                // typescript still doesn't know any more than this.

                // we name the type
                type WithString = typeof anObject

                const aWithString: WithString = anObject // works fine
                // this would not compile
                //     const mismatch: WithString = {aBool: true}

                expect(typeof anotherObject).toEqual('object') // clearly
                expect(typeof aWithString).toEqual('object') // surprised?
                // the keyword `type` names a type that already exists, but does not create a new JavaScript type,
                // and also doesn't create a new TypeScript type, either.
            })

            it("comes from a function",()=>{
                // here, a real function object, with a name
                function countOccurences(aString: string, aCharacter: string):number{
                    let occurences = 0
                    for(let c of aString){
                        if(c === aCharacter){
                            occurences++
                        }
                    }
                    return occurences
                }

                type Counter = typeof countOccurences

                // there doesn't have to be a function of this type yet
                type CounterApplyer = (aCounter: Counter, aString: string, aCharacter: string) => number // note that '='

                // function types are also compatible or not based on shape, this fat-arrow anonymous function is a CounterApplyer
                const f: CounterApplyer = (aCounter, aString, aChar) => {return aCounter(aString,aChar)}

                expect(countOccurences("aaabbbcdd","c")).toEqual(f(countOccurences,"aabbbcdd", "c"))
            })
        })
    })

    describe("Making new TypeScript types",()=>{
        describe("New types from scratch",()=> {
            it("may be done with classes", () => {
                class C {
                    aString: string
                    aNumber: number = 0 // see function worksOnThingsLikeC

                    constructor(aString: string) {
                        this.aString = aString;
                    }
                }

                const anInstance = new C('hello')
                expect(typeof anInstance).toEqual('object') // surprised? Why not 'C'?

                expect(anInstance instanceof C).toBeTruthy() // a-ha

                // but C _is_ a type, it can appear in a type context
                function worksOnCs(arg: C){
                    const {aString} = arg; // this will definitely work on any object that's an instance of C
                    return aString
                }
                expect(worksOnCs(anInstance)).toEqual('hello')

                function worksOnThingsLikeC<T extends C>(arg: T):string{
                    const {aString} = arg; // this will definitely work on any object that's an instance of a class that's at least C
                    // note that our destructuring literal object-alike thing doesn't mention aNumber, and that's ok
                    return aString
                }

                expect(worksOnThingsLikeC(anInstance)).toEqual('hello')

            })
            it("may be done with enums", () => {

            })
        })
        describe("From combinations of existing types",()=>{
            describe("With inheritance",()=>{
                class BaseClass {
                    aString: string

                    constructor(aString: string) {
                        this.aString = aString;
                    }
                }
                // explicitly, there is a set of objects called BaseClass and this is how you make them

                const aBaseClassInstance = new BaseClass('hello')

                function worksOnExactlyTheBaseClass(arg: BaseClass){
                    const {aString} = arg; // this will definitely work on any object that's an instance of C
                    return aString
                }
                expect(worksOnExactlyTheBaseClass(aBaseClassInstance)).toEqual('hello')

                class DerivedClass extends BaseClass{
                    aNumber: number

                    constructor(aString: string, aNumber: number) {
                        super(aString); // you don't _have_ to call this first, but please do.
                        this.aNumber = aNumber;
                    }
                }
                // explicitly, there is a set of objects called DerivedClass and this is how you make them
                const aDerivedClassInstance = new DerivedClass('goodbye', 123)
                // explicitly, set DerivedClass is a subset of BaseClass

                function worksOnAtLeastTheBaseClass<T extends BaseClass>(arg: T): string {
                    const {aString} = arg;
                    return aString
                }

                function worksOnExactlyTheDerivedClass(arg: DerivedClass): string {
                    const {aString, aNumber} = arg; // note that the two fields are delcared in this order, but initialised in the opposite order
                    return aString + aNumber
                }

                expect(worksOnExactlyTheBaseClass(aDerivedClassInstance)).toEqual('goodbye')
                expect(worksOnAtLeastTheBaseClass(aDerivedClassInstance)).toEqual('goodbye')
                expect(worksOnExactlyTheDerivedClass(aDerivedClassInstance)).toEqual('goodbye123')

                function perhapsSurprisinglyWorksOnExactlyTheDerivedClass(arg: DerivedClass):string{
                    const {aNumber, aString} = arg; // this sort of "destructuring" works on field names, not positions
                    // they are initialised in this order (dervied class fields, then base class fields) but declared in the opposite order
                    return aString + aNumber
                }

                expect(perhapsSurprisinglyWorksOnExactlyTheDerivedClass(aDerivedClassInstance)).toEqual('goodbye123')

            })

            describe("With unions (aka 'sum types')",() =>{

            });

            describe("What enums really are",()=>{

            })
        })
    })

    describe("Relationships between types",()=>{

    })
})