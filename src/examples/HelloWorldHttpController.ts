import { Controller, Get } from "../framework/datastructures/decorators/http.decorators";

@Controller(`/module1`)
export default class HelloWorldHttpController {

    @Get(`/hello-world`)
    public async helloWorld() {
        return {
            hello: 'world'
        }
    }
}