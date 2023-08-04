describe("Making new TypeScript types",()=> {
    describe("New types from scratch", () => {
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
            function worksOnCs(arg: C) {
                const {aString} = arg; // this will definitely work on any object that's an instance of C
                return aString
            }

            expect(worksOnCs(anInstance)).toEqual('hello')

            function worksOnThingsLikeC<T extends C>(arg: T): string {
                const {aString} = arg; // this will definitely work on any object that's an instance of a class that's at least C
                // note that our destructuring literal object-alike thing doesn't mention aNumber, and that's ok
                return aString
            }

            expect(worksOnThingsLikeC(anInstance)).toEqual('hello')

        })
        it("may be done with enums", () => {

        })
    })
    describe("From combinations of existing types", () => {
        describe("with 'extends'", () => {
            it("a relationship between classes", () => {
                class BaseClass {
                    aString: string

                    constructor(aString: string) {
                        this.aString = aString;
                    }
                }

                // explicitly, there is a set of objects called BaseClass and this is how you make them

                const aBaseClassInstance = new BaseClass('hello')

                function worksOnExactlyTheBaseClass(arg: BaseClass) {
                    const {aString} = arg; // this will definitely work on any object that's an instance of C
                    return aString
                }

                expect(worksOnExactlyTheBaseClass(aBaseClassInstance)).toEqual('hello')

                class DerivedClass extends BaseClass {
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
                    const {aString, aNumber} = arg; // note that the two fields are declared in this order, but initialised in the opposite order
                    return aString + aNumber
                }

                expect(worksOnExactlyTheBaseClass(aDerivedClassInstance)).toEqual('goodbye')
                expect(worksOnAtLeastTheBaseClass(aDerivedClassInstance)).toEqual('goodbye')
                expect(worksOnExactlyTheDerivedClass(aDerivedClassInstance)).toEqual('goodbye123')

                function perhapsSurprisinglyWorksOnExactlyTheDerivedClass(arg: DerivedClass): string {
                    const {aNumber, aString} = arg; // this sort of "destructuring" works on field names, not positions
                    // they are initialised in this order (derived class fields, then base class fields) but declared in the opposite order
                    return aString + aNumber
                }

                expect(perhapsSurprisinglyWorksOnExactlyTheDerivedClass(aDerivedClassInstance)).toEqual('goodbye123')

            })
        })

        describe("With unions (aka 'sum types')", () => {
            describe("By example", () => {
                it('can be with native JS types', () => {
                    let aChoiceOfString: "a" | "b" | "c"
                    aChoiceOfString = "a"
                    aChoiceOfString = "b"
                    aChoiceOfString = "c"
                    // aChoiceOfString = "d" would be a compiler error
                })
            })

            describe("By reference to existing types", () => {
                it("can be by references to native JavaScript types", () => {
                    let anObjectOrANumber: object | number
                    anObjectOrANumber = 1
                    anObjectOrANumber = {}
                    // anObjectOrANumber = "hello" would be a compiler error

                    // a more complex example
                    type StringOrNumber = string | number

                    type TheOtherOne<T extends StringOrNumber> = T extends string ? number : string

                    //which lets us say...
                    function stringToNumber(aString: string): StringOrNumber {
                        return Number.parseInt(aString, 10)
                    }

                    function numberToString(aNumber: number): StringOrNumber {
                        return `${aNumber}`
                    }

                    // how to use such a type? This really makes most sense when used with generic functions
                    // let's also say
                    type BetweenStringsAndNumbers<T extends StringOrNumber> = (x: StringOrNumber) => TheOtherOne<T>
                    function converter<T extends StringOrNumber>(x: T): TheOtherOne<T>{
                        let theFunction: (x: StringOrNumber) => TheOtherOne<T>
                        if (typeof x === typeof "") {
                            theFunction = (stringToNumber as BetweenStringsAndNumbers<T>) // we know that these are compatible, but must propmt the compiler
                        } else {
                            theFunction = (numberToString as BetweenStringsAndNumbers<T>) // otherwise it will not believe
                        }
                        return theFunction(x)
                    }
                    expect(converter("123")).toEqual(123)
                    expect(converter(123)).toEqual("123")
                    expect(converter(converter(123))).toEqual(123)
                    expect(converter(converter("123"))).toEqual("123")
                })
            })

            it("can be by reference to composite types",()=>{
                type Holder = StringHolder | NumberHolder // we can say this here as class names are "hoisted"

                class NumberHolder{
                    aNumber: number

                    constructor(aNumber: number) {
                        this.aNumber = aNumber
                    }
                    convert():StringHolder{
                        return new StringHolder (`${this.aNumber}`)
                    }
                }

                class StringHolder{
                    aString: string

                    constructor(aString: string) {
                        this.aString = aString
                    }

                    convert(): NumberHolder{
                        return new NumberHolder(Number.parseInt(this.aString,10))
                    }
                }


            })

            describe("What enums really are", () => {

            })
        })
    })
})
