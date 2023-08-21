import exp from "constants";

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
        it("may be done with enums, kinda", () => {
            enum Thing {
                FISH, //defaults to 0
                TIN,  //defaults to 1
                SKY   //defaults to 2
            }
            const aThing: Thing = Thing.FISH // for all you Zappa fans

            expect(typeof aThing).toEqual('number') // huh
            // but expect(aThing instanceof Thing).toBeTruthy() doesn't compile!
            // The error is that the RHS of instances of must be a subtype of any, or a Function type
            // which an enum isn't, apparently

            // and yet, enums can appear in a type context
            function thingerizer<T extends Thing>(aThinglike: T):void {
                const whatever: Thing = aThinglike
            }

            thingerizer(aThing) // fine
            enum OtherThings {
                FISH, //defaults to 0
                TIN,  //defaults to 1
                SKY,  //defaults to 2
                BOOT // defaults to 3
            }

            const anotherThing: OtherThings = OtherThings.FISH
            // thingerizer(anotherThing) doesn't compile
            // the error is that OtherThings.FISH is not assignable to type Thing

            // And yet...
            expect(Thing.FISH).toEqual(OtherThings.FISH) // passes!
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
                it("which could be native JavaScript types", () => {
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
                let aHolder: StringHolder | NumberHolder // this works because class names are "hoisted" to the top of their scope

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

                aHolder = new NumberHolder(123)
                expect(aHolder.aNumber).toEqual(123)
                expect(aHolder.convert()).toEqual(new StringHolder("123"))

            })

            describe("What enums really are", () => {
                describe("names for a bunch of literal constants",()=>{
                    it("could be default natural numbers",()=>{
                        enum DefaultValues{
                            A,
                            B,
                            C
                        }
                        expect(DefaultValues.B).toEqual(1)
                    })

                    it("could be natural numbers starting from some specific number",()=>{
                        enum DefaultValues{
                            A = 27,
                            B,
                            C
                        }
                        expect(DefaultValues.C).toEqual(29)
                    })

                    it("could be arbitrary natural numbers ",()=>{
                        enum DefaultValues{
                            A = 23,
                            B = 42,
                            C = 0
                        }
                        expect(DefaultValues.B).toEqual(42)
                    })

                    it("could be arbitrary numbers ",()=>{
                        enum DefaultValues{
                            A = -23,
                            B = 4.2,
                            C = 0
                        }
                        expect(DefaultValues.B).toEqual(4.2)
                    })

                    it("could be numbers or strings (who knows what for?)",()=>{
                        enum DefaultValues{
                            A = "fish",
                            B = 42,
                        }
                        expect(DefaultValues.B).toEqual(42)
                    })

                    it("could be implicit numbers and combinations of values",()=>{
                        enum Thing{
                            One,
                            TheOther,
                            Either = One | TheOther
                        }
                        expect(Thing.Either).toEqual(Thing.TheOther) // o-kayyy
                        expect(Thing.Either).not.toEqual(Thing.One) // this seems, frankly, unfair

                        // but the following doesn't compile

                        // enum Thing{
                        //    One= "one",
                        //   TheOther = "theOther",
                        //    Either = One | TheOther
                        // }

                        const oneThing: Thing = Thing.One
                        const otherThing: Thing = Thing.TheOther
                        const eitherThing: Thing = Thing.Either

                        let aThing: Thing = Thing.One
                        expect(aThing).toEqual(0)
                        expect(aThing).toEqual(Thing.One)
                        expect(aThing).not.toEqual(Thing.TheOther)
                        expect(aThing).not.toEqual(Thing.Either)

                        aThing = Thing.TheOther
                        expect(aThing).toEqual(1)
                        expect(aThing).toEqual(Thing.TheOther)
                        expect(aThing).not.toEqual(Thing.One)
                        expect(aThing).toEqual(Thing.Either) // uh

                        aThing = Thing.Either
                        expect(aThing).toEqual(1) // in fact, I at first expected 2.
                        expect(aThing).toEqual(Thing.Either)
                        expect(aThing).not.toEqual(Thing.One)
                        expect(aThing).toEqual(Thing.TheOther)
                    })


                    it("could be explicit numbers and combinations of values",()=>{
                        enum Thing{
                            One = 1,
                            TheOther = 2,
                            Either = One | TheOther
                        }
                        expect(Thing.Either).not.toEqual(Thing.One)  // this seems wildly unfair.
                        expect(Thing.Either).not.toEqual(Thing.TheOther)
                    })
                })

                describe("names for a bunch of singleton types!",()=>{

                    enum Thing {
                        One,
                        TheOther
                    }

                    it("creates a type for each element in the enum", ()=> {

                        const aOne: Thing.One = Thing.One
                        const anOther: Thing.TheOther = Thing.TheOther

                        function thingery(aThing: Thing): Thing { //this type Thing is like One | TheOther
                            return aThing
                        }

                        expect(thingery(aOne)).toEqual(Thing.One)
                        expect(thingery(anOther)).toEqual(Thing.TheOther)

                        function thingerySumType(aThing: Thing.One | Thing.TheOther): Thing {
                            return aThing
                        }

                        expect(thingerySumType(aOne)).toEqual(Thing.One)
                        expect(thingerySumType(anOther)).toEqual(Thing.TheOther)
                    })

                     it("also creates a type for the union of the strings",()=>{

                        type ThingStrings = keyof typeof Thing
                        type ReallyTheThingStrings = "One" | "TheOther"

                        function thingStringer(s: ReallyTheThingStrings) : ThingStrings{
                            return s
                        }

                        expect(thingStringer("One")).toEqual("One")
                    })
                })

                describe("an object",()=>{
                    enum Thing{
                        This,
                        That
                    }

                    it("has a forward mapping",()=> {
                        type ThisHaver = { This: number }

                        function theThis(argument: ThisHaver) {
                            return argument.This
                        }

                        expect(theThis(Thing)).toEqual(0)
                        expect(theThis(Thing)).toEqual(Thing.This)
                    })

                    it("has a reverse mapping",()=>{
                        expect(Thing[0]).toEqual("This")
                        expect(Thing[1]).toEqual("That")
                    })
                })
            })
        })
    })
})
