import { ContainerBase } from '@jwmb/pixelmagic/lib/ui/containerBase';
import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { Misc } from '@jwmb/pixelmagic/lib/utility/Misc';
import { Styles } from './styles';
import { SimpleText } from '@jwmb/pixelmagic/lib/ui/SimpleText';

export class NumberLine extends ContainerBase {
    /// Todo:Breakout to own arrows class
    public static getNumberString(value: number, decimals: number, fraction: number): string {
        // console.log(value);
        // console.log(decimals);
        // console.log(fraction);
        // if ( fraction > 1 ) {
        //   if(typeof decimals == "string"){
        //       var minmax = (<string><any>decimals).split("-").map(o=>Number(o));
        //       if(minmax.length == 1)
        //           return value.toFixed( minmax[0] );
        //       var valToFix = Number( (value * fraction).toFixed( ( minmax[ 1 ] )) );
        //       var valueDecimals = Misc.limitRange(this.decimalPlaces( (valToFix) ), ( minmax[ 0 ] ), ( minmax[ 1 ] ) );
        //       var fractionDecimals = Misc.limitRange( this.decimalPlaces( fraction ), ( minmax[ 0 ] ), ( minmax[ 1 ] ) );
        //
        //       return (valToFix).toFixed( valueDecimals ) + "/" + fraction.toFixed( fractionDecimals );
        //   }
        //    return (value * fraction).toFixed( decimals ) + "/" + fraction.toFixed( decimals );
        // }
        // if ( typeof decimals == "string" ) {
        //   var minmax = (<string><any>decimals).split( "-" ).map(o=>Number(o));
        //   if(minmax.length == 1)
        //       return value.toFixed( minmax[0] );
        //   var valToFix = Number( value.toFixed( ( minmax[1])));
        //   var valueDecimals = Misc.limitRange( this.decimalPlaces( valToFix ), ( minmax[ 0 ] ), ( minmax[ 1 ] ) );
        //
        //   return valToFix.toFixed( valueDecimals );
        //
        // }
        // return value.toFixed( decimals );

        if (fraction > 1) {
            if (typeof decimals === 'string') {
                const minmax = (<string><any>decimals).split('-').map(o => Number(o));
                if (minmax.length === 1) {
                    throw new Error('Numberline strange code');
                    // TODO: what was this supposed to do?
                    // return valToFix.toLocaleString(SR.instance.preferredLanguage,
                    //     { maximumFractionDigits: minmax[0], minimumFractionDigits: minmax[0] })
                    //     + '/' + fraction.toLocaleString(SR.instance.preferredLanguage,
                    //         { maximumFractionDigits: minmax[0], minimumFractionDigits: minmax[0] });
                }
                const valToFix = Number((value * fraction).toFixed((minmax[1])));
                const valueDecimals = Misc.limitRange(this.decimalPlaces((valToFix)), (minmax[0]), (minmax[1]));
                const fractionDecimals = Misc.limitRange(this.decimalPlaces(fraction), (minmax[0]), (minmax[1]));

                return valToFix.toLocaleString(SR.instance.preferredLanguage,
                    { maximumFractionDigits: valueDecimals, minimumFractionDigits: valueDecimals })
                    + '/' + fraction.toLocaleString(SR.instance.preferredLanguage,
                        { maximumFractionDigits: fractionDecimals, minimumFractionDigits: fractionDecimals });
                         // (valToFix).toFixed( valueDecimals ) + "/" + fraction.toFixed( fractionDecimals );
            }
            return (value * fraction).toLocaleString(SR.instance.preferredLanguage,
                { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + '/'
                + fraction.toLocaleString(SR.instance.preferredLanguage,
                    { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
                    // (valToFix).toFixed( valueDecimals ) + "/" + fraction.toFixed( fractionDecimals );
            // return (value * fraction).toLocaleString( SR.instance.preferredLanguage,
            // {maximumFractionDigits:valueDecimals,minimumFractionDigits:valueDecimals});//valToFix.toFixed( valueDecimals );
            // return (value * fraction).toFixed( decimals ) + "/" + fraction.toFixed( decimals );
        }
        if (typeof decimals === 'string') {
            const minmax = (<string><any>decimals).split('-').map(o => Number(o));
            if (minmax.length === 1) {
                return value.toLocaleString(SR.instance.preferredLanguage,
                    { maximumFractionDigits: minmax[0], minimumFractionDigits: minmax[0] });
            }
            const valToFix = Number(value.toFixed((minmax[1])));
            const valueDecimals = Misc.limitRange(this.decimalPlaces(valToFix), (minmax[0]), (minmax[1]));

            return valToFix.toLocaleString(SR.instance.preferredLanguage,
                { maximumFractionDigits: valueDecimals, minimumFractionDigits: valueDecimals });
                // valToFix.toFixed( valueDecimals );

        }
        return value.toLocaleString(SR.instance.preferredLanguage, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    }

    public static decimalPlaces(num) {
        const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            return 0;
        }
        return Math.max(
            0,
            (match[1] ? match[1].length : 0)
            - (match[2] ? +match[2] : 0));
    }

    private markerMods = [
        { y: -79, height: 91, width: 2, mod: 1000 },
        { y: -14, height: 26, width: 4, mod: 10 },
        { y: -10, height: 22, width: 2, mod: 5 },
        { y: 2, height: 10, width: 2, mod: 1 },
        { y: 6, height: 8, width: 1, mod: 0.5 },
        { y: 6, height: 4, width: 1, mod: 0.1 }
    ];


    constructor(private totalWidth: number, private totalHeight: number, private lineWidth: number,
        private min: number, private max: number, private labelMod: number, private decimals: number,
        private fractions: number) {
        super();

        if (this.fractions !== 0) {
            this.markerMods = [
                { y: -79, height: 91, width: 2, mod: 1000 },
                { y: -10, height: 22, width: 2, mod: 5 },
                { y: 2, height: 10, width: 2, mod: 1 },
                { y: 6, height: 4, width: 2, mod: 1 / this.fractions },
            ];
        } else if (this.decimals === 0) {
            this.markerMods = [
                { y: -79, height: 91, width: 2, mod: 1000 },
                { y: -14, height: 26, width: 4, mod: 10 },
                { y: -10, height: 22, width: 2, mod: 5 },
                { y: 2, height: 10, width: 2, mod: 1 },
            ];
        } else if (this.decimals === 2) {
            this.markerMods = [
                { y: -79, height: 91, width: 2, mod: 1000 },
                { y: -14, height: 26, width: 4, mod: 10 },
                { y: -10, height: 22, width: 2, mod: 5 },
                { y: 2, height: 10, width: 2, mod: 1 },
                { y: 6, height: 8, width: 1, mod: 0.5 },
                { y: 6, height: 4, width: 1, mod: 0.1 },
                { y: 6, height: 2, width: 1, mod: 0.01 }
            ];
        }
        console.log('DECIMALS');
        console.log(this.decimals);
        this.updateLine();
    }

    public updateLine() {
        const minStep = Math.min.apply(null, this.markerMods.map(o => o.mod));
        const graphics = new PIXI.Graphics();
        graphics.beginFill(Styles.color_ArrowsNumberline);

        graphics.drawRect(0, 0, this.totalWidth, this.lineWidth);

        const totalRange = this.max - this.min;
        for (let i = 0; i <= totalRange + 0.0005; i += minStep) {
            const xPos = (i / totalRange) * this.totalWidth;

            if (i === 0 || Misc.approximately(i, totalRange)) {
                graphics.drawRect(xPos - 2, -10, 4, 22);
            } else {
                for (let u = 0; u < this.markerMods.length; u++) {
                    const currentMarker = this.markerMods[u];
                    if (Misc.approximatelyDividable(this.min + i, currentMarker.mod)) {
                        graphics.drawRect(xPos - currentMarker.width * 0.5, currentMarker.y, currentMarker.width, currentMarker.height);
                        break;
                    }
                }
            }
        }
        graphics.endFill();

        if (this.labelMod > 0) {
            for (let i = Math.abs(this.min % this.labelMod); i < totalRange + this.labelMod * 0.1; i += this.labelMod) {
                const xPos = (i / totalRange) * this.totalWidth;
                const label = new SimpleText(NumberLine.getNumberString(this.min + i, this.decimals, this.fractions),
                    Styles.font_ArrowsNumberline);
                // label.alpha=0.5;

                const minusSignWidth = -2.5;
                label.position.x = xPos - label.width * 0.5 + this.lineWidth * 0.5 + (this.min + i < 0 ? minusSignWidth : 0);
                label.position.y = this.totalHeight + 11;
                this.addChild(label);

            }
        }
        this.addChild(graphics);
    }
}
