import config from "config";
import {compose} from "@hapi/glue";

import {registerJWTAuthStrategy} from "./plugins";
import {Database, initPool} from "./db";
import {AuthDao} from "./dao";
import {AuthHandlers} from "./handlers/auth.handlers";
import { ServiceHandlers } from "./handlers/service.handlers";

/**
 * Application initialises the API service and all of its dependencies
 */
export class Application {
  constructor() {
    // Bind our class methods to the class
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    // MARK: initialise all dependencies for the application here
    const db = new Database(initPool());

    // Service initialisation
    const authDao = new AuthDao(db);

    const serviceHandlers = new ServiceHandlers({db});
    const authHandlers = new AuthHandlers({
      db,
      authDao
    });

    this.handlers = [];
    // Controller initialisation
    this.handlers.push(serviceHandlers)
    this.handlers.push(authHandlers);
  }

  /**
   * Starts the application server
   * @return Promise<void> Promise to await for application startup
   */
  async start() {
    try {
      this.svc = await compose({
        server: {
          port: config.get('server.port') || 8080,
          routes: {
            validate: {
              failAction: async (request, h, err) => {
                throw err;
              }
            }
          }
        },
        register: {
          plugins: [
            {
              plugin: require('hapi-pino'),
              options: {
                prettyPrint: process.env.NODE_ENV !== 'production',
                redact: ['req.headers.authorization']
              }
            }
          ]
        }
      }, {
        relativeTo: __dirname
      });

      registerJWTAuthStrategy(this.svc);
      for (const handler of this.handlers) {
        handler.routes(this.svc);
      }

      await this.svc.start();
    } catch (err) {
      throw new Error(`unable to start application server: ${err}`)
    }
  }

  /**
   * Stops the application server
   * @return {Promise<void>} Promise to await for application shutdown
   */
  async stop() {
    if (!this.svc) {
      return;
    }
    return this.svc.stop();
  }
}
