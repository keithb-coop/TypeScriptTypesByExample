import exp from "constants";

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

        it("it considers values of types that don't overlap to be consistent so long as they match both", () => {
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

        it("works for functions, too",()=>{
            function f(anObject: object, aNumber: number): string {return "nonsense"}
            function g(anObject: object, aNumber: number): string {return "other nonsense"}
            let h: typeof f = g
            expect(h({},0)).toEqual("other nonsense")
        })
    })

