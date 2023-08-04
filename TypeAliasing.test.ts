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

