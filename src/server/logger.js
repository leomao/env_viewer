import winston from 'winston';                                                   
                                                                                 
const loggerOptions = {                                                          
  console: {                                                                     
    prettyPrint: true,                                                           
    colorize: 'all',                                                             
  },                                                                             
};                                                                               
                                                                                 
const logger = winston.loggers.add('root', loggerOptions);                       
logger.cli();                                                                    
                                                                                 
export default logger;
