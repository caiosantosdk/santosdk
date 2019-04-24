import { httpBoot } from "./framework/infrastructure/http";
import { getLoggerFor } from "./framework/infrastructure/logger";
import { mongoBoot } from "./framework/infrastructure/mongo";
import * as dotenv from "dotenv";
dotenv.config();




const bootApplication = async () => {
    await httpBoot();
    await mongoBoot();
}




(async () => {

    const logger = await getLoggerFor(`app`);
    
    try {
        await bootApplication();
    } catch (err) {
        logger.error(err);
    }
    
})()