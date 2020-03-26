class PowerStations {
    constructor(power = 1) {
        // MWh
        power = (power > 100) ? 100 : ((power < 1) ? 1 : power);// 1 < power < 100
        
        this.dayPower = power;
        this.nightPower = power;
    }
}//class PowerStations

class SunPannels extends PowerStations {
    constructor(power = 1) {
        // MWh
        super((power > 5) ? 5 : power);
        this.nightPower = 0;
    }
}//class SunPannels

class Houses {
    constructor(apartmentsAmount = 1) {
        this.apartmentsAmount = (apartmentsAmount < 1) ? 1 : ((apartmentsAmount > 400) ? 400 : apartmentsAmount);
        //kWh
        this.dayPower = 4;
        this.nightPower = 1;
    }    
}//class Houses

class PowerLines {
    constructor(power = 1, price = 1) {
        //MWh
        this.power = power;
        this.price = price;
    }
}//class PowerLines

class ElectroNetwork {
    constructor(producers = [], consumers = [], powerLines = []) {
        this.producers = producers;//PowerStations, SunPannels
        this.consumers = consumers;//Houses
        this.powerLines = powerLines;

        this.dayHours = 15;
        this.nightHours = 24 - this.dayHours;
    }

    getProducingPower() { return this.getPower(true); }

    getConsumingPower() { return this.getPower(false); }

    getPower(isProducing = true) {
        let res = {day: 0, night: 0};
        let kiloWattCoefficient = isProducing ? 1 : 0.001; //kWh into MWh
        this[isProducing ? 'producers' : 'consumers'].forEach(e => {
            res.day += (e.dayPower * kiloWattCoefficient * (isProducing ? 1 : e.apartmentsAmount));
            res.night += (e.nightPower * kiloWattCoefficient * (isProducing ? 1 : e.apartmentsAmount));
        });
        return res;
    }

    sortPowerLinesByPrice(isSortByMax = true) {
        this.powerLines.sort((a, b) => (a.price - b.price) * (isSortByMax ? -1 : 1));
    }

    getBalanceInfo() {
        let producingPower = this.getProducingPower();
        let consumingPower = this.getConsumingPower();

        let powerOutcome = {
            day: producingPower.day - consumingPower.day, 
            night: producingPower.night - consumingPower.night,
        };

        return {
            day: {
                power: powerOutcome.day * this.dayHours,
                price: this.getPowerOutcomePrice(powerOutcome.day) * this.dayHours
            },
            night: {                
                power: powerOutcome.night * this.nightHours,
                price: this.getPowerOutcomePrice(powerOutcome.night) * this.nightHours
            }
        };
    }

    getPowerOutcomePrice(power = 0) {
        if (!power) { return 0; }

        let isSelling = (power > 0);
        this.sortPowerLinesByPrice(isSelling);//sort for buying cheapper, selling expensive

        let price = 0;
        power = power * (isSelling ? 1 : -1);
        for (let powerLine of this.powerLines) {
            if (power >= powerLine.power) {
                price += (powerLine.power * powerLine.price);
                power -= powerLine.power;
            } else {
                price += (power * powerLine.price);
                break;
            }
        }
        return price * (isSelling ? 1 : -1);
    }

    printNetworkObjects() {
        console.log('Electro network structure:');
        console.log('Producers: \n', this.producers);
        console.log('Consumers: \n', this.consumers);
        console.log('Power lines: \n', this.powerLines);
    }
}//class ElectroNetwork

//-------------------------------------------------------------------------------------------------------------------------
/*
//let powerProducers = [new PowerStations(95), new PowerStations(19), new SunPannels(6), new SunPannels(5), new SunPannels(2), new SunPannels(3)];
let powerProducers = [new SunPannels(2), new SunPannels(3)];
let powerConsumers = [new Houses(211), new Houses(401), new Houses(19), new Houses(1000)];
let powerLines = [new PowerLines(20, 10), new PowerLines(10, 5), new PowerLines(23, 11)];
*/

//generating network
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};

let powerProducers = [];
for (let i = 0; i < getRandomInt(1, 7); i++) { powerProducers.push(new PowerStations(getRandomInt(1, 101))); }
for (let i = 0; i < getRandomInt(1, 30); i++) { powerProducers.push(new SunPannels(getRandomInt(1, 6))); }

let powerConsumers = [];
for (let i = 0; i < getRandomInt(1, 100); i++) { powerConsumers.push(new Houses(getRandomInt(1, 401))); }

let powerLines = [];
for (let i = 0; i < getRandomInt(1, 50); i++) { powerLines.push(new PowerLines(getRandomInt(5, 20), getRandomInt(10, 20))); }

let electroNetwork = new ElectroNetwork(powerProducers, powerConsumers, powerLines);
electroNetwork.printNetworkObjects();

console.log('\nBalance info:');
console.log(electroNetwork.getBalanceInfo());
