import { SR } from '@jwmb/pixelmagic/lib/utility/StringResources';
import { StimuliWord } from './stimuliWord';

export class WordList {
    // public static verifyResources() {
    //     var languageCode = 'sv-SE';

    //     SR.instance.preferredLanguage = languageCode;
    //     var SRProblems = WordList.wordList.filter(_ => SR.getIfExists('word_' + _.word) ? false : true).map(_ => _.word);
    //     console.log('Word list StringResource problems (' + SRProblems.length + '):\n' + SRProblems.join('\n'));

    //     // WordList.wordList = [new StimuliWord('te', 1, "kakakak", 'bluppo.png'),
    //     // new StimuliWord('tå', 1, 'reading_words_taa', 'wordpic_taa.png'), ];
    //     PixelMagic.WebAudio.SoundManager2.instance.voiceOverLanguage = languageCode;
    //     var sounds = WordList.wordList.filter(_ => _.hasSound).map(_ => _.soundPath);
    //     sounds = sounds.map(_ => WebAudio.SoundManager2.instance.getPath(_, 'voice'));
    //     // TODO: hasSound doesn't work //_.soundPath ? true : false
    //     PixelMagic.WebAudio.SoundManager2.checkSounds(sounds).then(result => {
    //         console.log('Word list sound problems: ' + result.map(_ => _.path + '\t' + _.error).join('\n'));
    //     });

    //     // WordList.wordList = [new StimuliWord('te', 1, null, 'bluppo.png'),
    //     //  new StimuliWord('tå', 1, 'reading_words_taa', 'wordpic_taa.png'),];
    //     var picLODList = [0, 1, 2];
    //     var pics = <SimpleBitmap[]>[].concat.apply([], WordList.wordList.
    //         // filter(_ => _.hasImage).map(_ => picLODList.map(lod => _.getImage(lod))));
    //     // var missingPics = pics.filter(_ => _.texture.width <= 0).map(_ => _.texture.baseTexture.imageUrl);
    //     var picUrls = pics.map(_ => _.texture.baseTexture.imageUrl);
    //     AssetLoader.load(picUrls, () => { //TODO: same code as CrossWordStore
    //         var withErrors = picUrls.map(_ => { return { url: _, asset: AssetLoader.getAsset(_) }; })
    //           // .filter(_ => _.asset.error? true : false);
    //         var msg = withErrors.map(_ => '' + _.url + '\t' + _.asset.error).join('\n');
    //         console.log('Word list image problems (' + withErrors.length + '):\n' + msg);
    //     });
    // }
    // Todo: Do create clones when the word list is requested instead of passing around the originals.

    private static wordList: Array<StimuliWord> = [ // TODO: this list should be in separate external resource
        new StimuliWord('te', 1, null, 'wordpic_te.png'),
        new StimuliWord('tå', 1, 'reading_words_taa', 'wordpic_taa.png'),
        new StimuliWord('is', 1, 'reading_words_is', 'wordpic_is.png'),
        new StimuliWord('ko', 1, null, 'wordpic_ko.png'),
        new StimuliWord('sax', 1, null, 'wordpic_sax.png'),
        new StimuliWord('orm', 1, 'reading_words_orm', 'wordpic_orm.png'),
        new StimuliWord('haj', 1, null, 'wordpic_haj.png'),
        new StimuliWord('fot', 1, null, 'wordpic_fot.png'),
        new StimuliWord('ros', 1, 'reading_words_ros', 'wordpic_ros.png'),
        new StimuliWord('nål', 1, 'reading_words_naal', 'wordpic_naal.png'),
        new StimuliWord('väg', 1, null, 'wordpic_vaeg.png'),
        new StimuliWord('pil', 1, 'reading_words_pil', 'wordpic_pil.png'),
        new StimuliWord('öra', 1, 'reading_words_oera', 'wordpic_oera.png'),
        new StimuliWord('tåg', 1, null, 'wordpic_taag.png'),
        new StimuliWord('bok', 1, 'reading_words_bok', 'wordpic_bok.png'),
        new StimuliWord('öga', 1, 'reading_words_oega', 'wordpic_oega.png'),
        new StimuliWord('eld', 1, null, 'wordpic_eld.png'),
        new StimuliWord('hus', 1, null, 'wordpic_hus.png'),
        new StimuliWord('nöt', 1, null, 'wordpic_noet.png'),
        new StimuliWord('räv', 1, null, 'wordpic_raev.png'),
        new StimuliWord('får', 1, 'reading_words_faar', 'wordpic_faar.png'),
        new StimuliWord('såg', 1, null, 'wordpic_saag.png'),
        new StimuliWord('sol', 1, 'reading_words_sol', 'wordpic_sol.png'),
        new StimuliWord('apa', 1, null, 'wordpic_apa.png'),
        new StimuliWord('bil', 1, 'reading_words_bil', 'wordpic_bil.png'),
        new StimuliWord('båt', 1, null, 'wordpic_baat.png'),
        new StimuliWord('ost', 1, null, 'wordpic_ost.png'),
        new StimuliWord('gem', 1, null, 'wordpic_gem.png'),
        new StimuliWord('ägg', 1, null, 'wordpic_aegg.png'),
        new StimuliWord('hund', 1, 'reading_words_hund', 'wordpic_hund.png'),
        new StimuliWord('sten', 1, null, 'wordpic_sten.png'),
        new StimuliWord('stol', 1, null, 'wordpic_stol.png'),
        new StimuliWord('glas', 1, null, 'wordpic_glas.png'),
        new StimuliWord('spik', 1, null, 'wordpic_spik.png'),
        new StimuliWord('gren', 1, null, 'wordpic_gren.png'),
        new StimuliWord('kaka', 1, null, 'wordpic_kaka.png'),
        new StimuliWord('gris', 1, 'reading_words_gris', 'wordpic_gris.png'),
        new StimuliWord('ett', 1, 'general_number1', null),
        new StimuliWord('två', 1, 'general_number2', null),
        new StimuliWord('tre', 1, 'general_number3', null),
        new StimuliWord('fyra', 1, 'general_number4', null),
        new StimuliWord('fem', 1, 'general_number5', null),
        new StimuliWord('sex', 1, 'general_number6', null),
        new StimuliWord('sju', 1, 'general_number7', null),
        new StimuliWord('åtta', 1, 'general_number8', null),
        new StimuliWord('nio', 1, 'general_number9', null),
        new StimuliWord('tio', 1, 'general_number10', null),
        new StimuliWord('elva', 1, 'general_number11', null),
        new StimuliWord('tolv', 1, 'general_number12', null),
        new StimuliWord('tretton', 1, 'general_number13', null),
        new StimuliWord('fjorton', 1, 'general_number14', null),
        new StimuliWord('femton', 1, 'general_number15', null),
        new StimuliWord('sexton', 1, 'general_number16', null),
        new StimuliWord('sjutton', 1, 'general_number17', null),
        new StimuliWord('arton', 1, 'general_number18', null),
        new StimuliWord('nitton', 1, 'general_number19', null),
        new StimuliWord('tjugo', 1, 'general_number20', null),
        new StimuliWord('trettio', 1, 'general_number30', null),
        new StimuliWord('fyrtio', 1, 'general_number40', null),
        new StimuliWord('femtio', 1, 'general_number50', null),
        new StimuliWord('sextio', 1, 'general_number60', null),
        new StimuliWord('sjuttio', 1, 'general_number70', null),
        new StimuliWord('åttio', 1, 'general_number80', null),
        new StimuliWord('nittio', 1, 'general_number90', null),
        new StimuliWord('hundra', 1, 'general_number100', null),
        new StimuliWord('banan', 1, null, 'wordpic_banan.png'),
        new StimuliWord('morot', 1, null, 'wordpic_morot.png'),
        new StimuliWord('planet', 1, null, 'wordpic_planet.png'),
        new StimuliWord('kanin', 1, null, 'wordpic_kanin.png'),
        new StimuliWord('kanot', 1, null, 'wordpic_kanot.png'),
        new StimuliWord('måne', 1, null, 'wordpic_maane.png'),
        new StimuliWord('zebra', 1, null, 'wordpic_zebra.png'),
        new StimuliWord('anka', 1, null, 'wordpic_anka.png'),
        new StimuliWord('ben', 1, null, 'wordpic_ben.png'),
        new StimuliWord('bi', 1, 'reading_words_bi', 'wordpic_bi.png'),
        new StimuliWord('bro', 1, null, 'wordpic_bro.png'),
        new StimuliWord('bröd', 1, null, 'wordpic_broed.png'),
        new StimuliWord('bur', 1, null, 'wordpic_bur.png'),
        new StimuliWord('citron', 1, null, 'wordpic_citron.png'),
        new StimuliWord('dator', 1, null, 'wordpic_dator.png'),
        new StimuliWord('drake', 1, null, 'wordpic_drake.png'),
        new StimuliWord('fågel', 1, null, 'wordpic_faagel.png'),
        new StimuliWord('fiol', 1, 'reading_words_fiol', 'wordpic_fiol.png'),
        new StimuliWord('fisk', 1, null, 'wordpic_fisk.png'),
        new StimuliWord('fluga', 1, null, 'wordpic_fluga.png'),
        new StimuliWord('hand', 1, null, 'wordpic_hand.png'),
        new StimuliWord('hår', 1, null, 'wordpic_haar.png'),
        new StimuliWord('häst', 1, null, 'wordpic_haest.png'),
        new StimuliWord('kam', 1, null, 'wordpic_kam.png'),
        new StimuliWord('karta', 1, null, 'wordpic_karta.png'),
        new StimuliWord('krona', 1, null, 'wordpic_krona.png'),
        new StimuliWord('kruka', 1, null, 'wordpic_kruka.png'),
        new StimuliWord('låda', 1, null, 'wordpic_laada.png'),
        new StimuliWord('lampa', 1, null, 'wordpic_lampa.png'),
        new StimuliWord('larv', 1, 'reading_words_larv', 'wordpic_larv.png'),
        new StimuliWord('linjal', 1, null, 'wordpic_linjal.png'),
        new StimuliWord('lök', 1, null, 'wordpic_loek.png'),
        new StimuliWord('mage', 1, null, 'wordpic_mage.png'),
        new StimuliWord('moln', 1, null, 'wordpic_moln.png'),
        new StimuliWord('mun', 1, null, 'wordpic_mun.png'),
        new StimuliWord('mur', 1, null, 'wordpic_mur.png'),
        new StimuliWord('ödla', 1, null, 'wordpic_oedla.png'),
        new StimuliWord('paj', 1, null, 'wordpic_paj.png'),
        new StimuliWord('rök', 1, null, 'wordpic_roek.png'),
        new StimuliWord('säl', 1, null, 'wordpic_sael.png'),
        new StimuliWord('sko', 1, null, 'wordpic_sko.png'),
        new StimuliWord('spis', 1, null, 'wordpic_spis.png'),
        new StimuliWord('spöke', 1, null, 'wordpic_spoeke.png'),
        new StimuliWord('stege', 1, null, 'wordpic_stege.png'),
        new StimuliWord('svamp', 1, null, 'wordpic_svamp.png'),
        new StimuliWord('svans', 1, null, 'wordpic_svans.png'),
        new StimuliWord('tak', 1, 'reading_words_tak', 'wordpic_tak.png'),
        new StimuliWord('tält', 1, null, 'wordpic_taelt.png'),
        new StimuliWord('tand', 1, null, 'wordpic_tand.png'),
        new StimuliWord('träd', 1, null, 'wordpic_traed.png'),
        new StimuliWord('våg', 1, null, 'wordpic_vaag.png'),
        new StimuliWord('val', 1, 'reading_words_val', 'wordpic_val.png'),
        new StimuliWord('vante', 1, null, 'wordpic_vante.png'),
        new StimuliWord('visp', 1, null, 'wordpic_visp.png'),
        new StimuliWord('yxa', 1, 'reading_words_yxa', 'wordpic_yxa.png'),
        new StimuliWord('gul', 1, null, 'wordpic_gul.png'),
        new StimuliWord('röd', 1, null, 'wordpic_roed.png'),
        new StimuliWord('grön', 1, null, 'wordpic_groen.png'),
        new StimuliWord('blå', 1, null, 'wordpic_blaa.png'),
        new StimuliWord('rosa', 1, null, 'wordpic_rosa.png'),
        new StimuliWord('brun', 1, null, 'wordpic_brun.png'),
        new StimuliWord('lila', 1, null, 'wordpic_lila.png'),
        new StimuliWord('vit', 1, null, 'wordpic_vit.png'),
        new StimuliWord('svart', 1, null, 'wordpic_svart.png'),
        new StimuliWord('grå', 1, null, 'wordpic_graa.png'),
        new StimuliWord('ballong', 2, null, 'wordpic_ballong.png'),
        new StimuliWord('cykel', 3, null, 'wordpic_cykel.png'),
        new StimuliWord('radio', 3, null, 'wordpic_radio.png'),
        new StimuliWord('hopprep', 3, null, 'wordpic_hopprep.png'),
        new StimuliWord('hästsko', 3, null, 'wordpic_haestsko.png'),
        new StimuliWord('brevlåda', 3, null, null),
        new StimuliWord('diskborste', 3, null, null),
        new StimuliWord('dusch', 3, null, null),
        new StimuliWord('ekorre', 3, null, null),
        new StimuliWord('etikett', 3, null, null),
        new StimuliWord('finger', 3, null, null),
        new StimuliWord('flamingo', 3, null, null),
        new StimuliWord('fontän', 3, null, null),
        new StimuliWord('garage', 3, null, null),
        new StimuliWord('giraff', 3, null, null),
        new StimuliWord('hink', 2, null, null),
        new StimuliWord('hundkoja', 3, null, null),
        new StimuliWord('julgran', 2, null, null),
        new StimuliWord('kamera', 2, null, null),
        new StimuliWord('korall', 3, null, null),
        new StimuliWord('krokodil', 3, null, null),
        new StimuliWord('motorcykel', 3, null, null),
        new StimuliWord('mussla', 3, null, null),
        new StimuliWord('palett', 3, null, null),
        new StimuliWord('papegoja', 3, null, null),
        new StimuliWord('pengar', 3, null, null),
        new StimuliWord('piano', 3, null, null),
        new StimuliWord('pingvin', 3, null, null),
        new StimuliWord('plommon', 3, null, null),
        new StimuliWord('pyramid', 3, null, null),
        new StimuliWord('regnbåge', 3, null, null),
        new StimuliWord('ring', 2, null, null),
        new StimuliWord('rosett', 3, null, null),
        new StimuliWord('säng', 3, null, null),
        new StimuliWord('sjö', 3, null, null),
        new StimuliWord('skärp', 3, null, null),
        new StimuliWord('skepp', 3, null, null),
        new StimuliWord('skidor', 3, null, null),
        new StimuliWord('skinka', 3, null, null),
        new StimuliWord('skylt', 3, null, null),
        new StimuliWord('spargris', 3, null, null),
        new StimuliWord('stjärna', 4, null, null),
        new StimuliWord('telefon', 3, null, null),
        new StimuliWord('tidning', 3, null, null),
        new StimuliWord('tunga', 3, null, null),
        new StimuliWord('ubåt', 3, null, null),
        new StimuliWord('våffla', 3, null, null),
        new StimuliWord('vagn', 3, null, null),
        new StimuliWord('vattenpöl', 3, null, null),
        new StimuliWord('ängel', 3, null, null),
        new StimuliWord('buss', 3, null, 'wordpic_buss.png'),
        new StimuliWord('ankare', 3, null, 'wordpic_ankare.png'),
        new StimuliWord('äpple', 3, null, 'wordpic_aepple.png'),
        new StimuliWord('åra', 3, null, 'wordpic_aara.png'),
        new StimuliWord('ärta', 3, null, 'wordpic_aerta.png'),
        new StimuliWord('åsna', 3, null, 'wordpic_aasna.png'),
        new StimuliWord('badkar', 3, null, 'wordpic_badkar.png'),
        new StimuliWord('björn', 3, null, 'wordpic_bjoern.png'),
        new StimuliWord('boll', 3, null, 'wordpic_boll.png'),
        new StimuliWord('borste', 3, null, 'wordpic_borste.png'),
        new StimuliWord('byxor', 3, null, 'wordpic_byxor.png'),
        new StimuliWord('delfin', 3, null, null),
        new StimuliWord('fabrik', 3, null, 'wordpic_fabrik.png'),
        new StimuliWord('fjäder', 3, null, 'wordpic_fjaeder.png'),
        new StimuliWord('fladdermus', 3, null, 'wordpic_fladdermus.png'),
        new StimuliWord('flaska', 3, null, 'wordpic_flaska.png'),
        new StimuliWord('flodhäst', 3, null, 'wordpic_flodhaest.png'),
        new StimuliWord('fönster', 3, null, 'wordpic_foenster.png'),
        new StimuliWord('fotboll', 3, null, 'wordpic_fotboll.png'),
        new StimuliWord('frimärke', 3, null, 'wordpic_frimaerke.png'),
        new StimuliWord('gardin', 3, null, 'wordpic_gardin.png'),
        new StimuliWord('glasögon', 3, null, 'wordpic_glasoegon.png'),
        new StimuliWord('glass', 3, null, null),
        new StimuliWord('halsduk', 3, null, 'wordpic_halsduk.png'),
        new StimuliWord('hammare', 3, null, 'wordpic_hammare.png'),
        new StimuliWord('jordgubbe', 3, null, 'wordpic_jordgubbe.png'),
        new StimuliWord('kamel', 3, null, 'wordpic_kamel.png'),
        new StimuliWord('krabba', 3, null, 'wordpic_krabba.png'),
        new StimuliWord('kudde', 3, null, 'wordpic_kudde.png'),
        new StimuliWord('lejon', 3, null, 'wordpic_lejon.png'),
        new StimuliWord('medalj', 3, null, 'wordpic_medalj.png'),
        new StimuliWord('oliv', 3, null, 'wordpic_oliv.png'),
        new StimuliWord('paprika', 3, null, 'wordpic_paprika.png'),
        new StimuliWord('paraply', 3, null, 'wordpic_paraply.png'),
        new StimuliWord('pensel', 3, null, 'wordpic_pensel.png'),
        new StimuliWord('potatis', 3, null, 'wordpic_potatis.png'),
        new StimuliWord('purjolök', 3, null, 'wordpic_purjoloek.png'),
        new StimuliWord('räka', 3, null, null),
        new StimuliWord('raket', 3, null, 'wordpic_raket.png'),
        new StimuliWord('sandlåda', 3, null, 'wordpic_sandlaada.png'),
        new StimuliWord('skruv', 3, null, 'wordpic_skruv.png'),
        new StimuliWord('spruta', 3, null, 'wordpic_spruta.png'),
        new StimuliWord('staty', 3, null, 'wordpic_staty.png'),
        new StimuliWord('stövel', 3, null, 'wordpic_stoevel.png'),
        new StimuliWord('taxi', 3, null, 'wordpic_taxi.png'),
        new StimuliWord('tvål', 3, null, 'wordpic_tvaal.png'),
        new StimuliWord('uggla', 3, null, 'wordpic_uggla.png'),
        new StimuliWord('yla', 3, 'reading_words_yla', null),
        new StimuliWord('yr', 3, 'reading_words_yr', null),
        new StimuliWord('osthyvel', 3, null, 'wordpic_osthyvel.png'),
        new StimuliWord('prinsessa', 3, null, 'wordpic_prinsessa.png'),
        new StimuliWord('al', 1, 'reading_words_al', null),
        new StimuliWord('os', 1, 'reading_words_os', null),
        new StimuliWord('el', 1, 'reading_words_el', null),
        new StimuliWord('en', 1, 'reading_words_en', null),
        new StimuliWord('er', 1, 'reading_words_er', null),
        new StimuliWord('le', 1, 'reading_words_le', null),
        new StimuliWord('ås', 1, 'reading_words_aas', null),
        new StimuliWord('år', 1, 'reading_words_aar', null),
        new StimuliWord('må', 1, 'reading_words_maa', null),
        new StimuliWord('fe', 1, 'reading_words_fe', null),
        new StimuliWord('nå', 1, 'reading_words_naa', null),
        new StimuliWord('få', 1, 'reading_words_faa', null),
        new StimuliWord('ro', 1, 'reading_words_ro', null),
        new StimuliWord('ur', 1, 'reading_words_ur', null),
        new StimuliWord('ek', 1, 'reading_words_ek', null),
        new StimuliWord('uv', 1, 'reading_words_uv', null),
        new StimuliWord('på', 1, 'reading_words_paa', null),
        new StimuliWord('du', 1, 'reading_words_du', null),
        new StimuliWord('då', 1, 'reading_words_daa', null),
        new StimuliWord('de', 1, 'reading_words_de', null),
        new StimuliWord('vi', 1, 'reading_words_vi', null),
        new StimuliWord('gå', 1, 'reading_words_gaa', null),
        new StimuliWord('ny', 1, 'reading_words_ny', null),
        new StimuliWord('sy', 1, 'reading_words_sy', null),
        new StimuliWord('nu', 1, 'reading_words_nu', null),
        new StimuliWord('lås', 1, 'reading_words_laas', null),
        new StimuliWord('nos', 1, 'reading_words_nos', null),
        new StimuliWord('sal', 1, 'reading_words_sal', null),
        new StimuliWord('sår', 1, 'reading_words_saar', null),
        new StimuliWord('ris', 1, 'reading_words_ris', null),
        new StimuliWord('små', 1, 'reading_words_smaa', null),
        new StimuliWord('mål', 1, 'reading_words_maal', null),
        new StimuliWord('mås', 1, 'reading_words_maas', null),
        new StimuliWord('gås', 1, 'reading_words_gaas', null),
        new StimuliWord('arm', 1, 'reading_words_arm', null),
        new StimuliWord('fyr', 1, 'reading_words_fyr', null),
        new StimuliWord('fet', 1, 'reading_words_fet', null),
        new StimuliWord('duk', 1, 'reading_words_duk', null),
        new StimuliWord('tam', 1, 'reading_words_tam', null),
        new StimuliWord('hal', 1, 'reading_words_hal', null),
        new StimuliWord('ram', 1, 'reading_words_ram', null),
        new StimuliWord('jul', 1, 'reading_words_jul', null),
        new StimuliWord('lek', 1, 'reading_words_lek', null),
        new StimuliWord('tur', 1, 'reading_words_tur', null),
        new StimuliWord('tax', 1, 'reading_words_tax', null),
        new StimuliWord('tub', 1, 'reading_words_tub', null),
        new StimuliWord('lya', 1, 'reading_words_lya', null),
        new StimuliWord('tarm', 1, 'reading_words_tarm', null),
        new StimuliWord('varm', 1, 'reading_words_varm', null),
        new StimuliWord('fest', 1, 'reading_words_fest', null),
        new StimuliWord('valp', 1, 'reading_words_valp', null),
        new StimuliWord('katt', 1, 'reading_words_katt', null),
        new StimuliWord('klo', 1, 'reading_words_klo', null),
        new StimuliWord('smal', 1, 'reading_words_smal', null),
        new StimuliWord('klok', 1, 'reading_words_klok', null),
        new StimuliWord('vink', 1, 'reading_words_vink', null),
        new StimuliWord('kniv', 1, 'reading_words_kniv', null),
        new StimuliWord('viol', 1, 'reading_words_viol', null),
        new StimuliWord('a', 1, 'reading_letters_a', null),
        new StimuliWord('b', 1, 'reading_letters_b', null),
        new StimuliWord('c', 1, 'reading_letters_c', null),
        new StimuliWord('d', 1, 'reading_letters_d', null),
        new StimuliWord('e', 1, 'reading_letters_e', null),
        new StimuliWord('f', 1, 'reading_letters_f', null),
        new StimuliWord('g', 1, 'reading_letters_g', null),
        new StimuliWord('h', 1, 'reading_letters_h', null),
        new StimuliWord('i', 1, 'reading_letters_i', null),
        new StimuliWord('j', 1, 'reading_letters_j', null),
        new StimuliWord('k', 1, 'reading_letters_k', null),
        new StimuliWord('l', 1, 'reading_letters_l', null),
        new StimuliWord('m', 1, 'reading_letters_m', null),
        new StimuliWord('n', 1, 'reading_letters_n', null),
        new StimuliWord('o', 1, 'reading_letters_o', null),
        new StimuliWord('p', 1, 'reading_letters_p', null),
        new StimuliWord('q', 1, 'reading_letters_q', null),
        new StimuliWord('r', 1, 'reading_letters_r', null),
        new StimuliWord('s', 1, 'reading_letters_s', null),
        new StimuliWord('t', 1, 'reading_letters_t', null),
        new StimuliWord('u', 1, 'reading_letters_u', null),
        new StimuliWord('v', 1, 'reading_letters_v', null),
        new StimuliWord('w', 1, 'reading_letters_w', null),
        new StimuliWord('x', 1, 'reading_letters_x', null),
        new StimuliWord('y', 1, 'reading_letters_y', null),
        new StimuliWord('z', 1, 'reading_letters_z', null),
        new StimuliWord('å', 1, 'reading_letters_aa', null),
        new StimuliWord('ä', 1, 'reading_letters_ae', null),
        new StimuliWord('ö', 1, 'reading_letters_oe', null),
    ];

    private static letterList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'
        , 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'å', 'ä', 'ö'];

    private static stimuliLetterList = [
        new StimuliWord('a', 1, 'reading_letters_a', null),
        new StimuliWord('b', 1, 'reading_letters_b', null),
        new StimuliWord('c', 1, 'reading_letters_c', null),
        new StimuliWord('d', 1, 'reading_letters_d', null),
        new StimuliWord('e', 1, 'reading_letters_e', null),
        new StimuliWord('f', 1, 'reading_letters_f', null),
        new StimuliWord('g', 1, 'reading_letters_g', null),
        new StimuliWord('h', 1, 'reading_letters_h', null),
        new StimuliWord('g', 1, 'reading_letters_i', null),
        new StimuliWord('i', 1, 'reading_letters_i', null),
        new StimuliWord('j', 1, 'reading_letters_j', null),
        new StimuliWord('k', 1, 'reading_letters_k', null),
        new StimuliWord('l', 1, 'reading_letters_l', null),
        new StimuliWord('m', 1, 'reading_letters_m', null),
        new StimuliWord('n', 1, 'reading_letters_n', null),
        new StimuliWord('o', 1, 'reading_letters_o', null),
        new StimuliWord('p', 1, 'reading_letters_p', null),
        new StimuliWord('q', 1, 'reading_letters_q', null),
        new StimuliWord('r', 1, 'reading_letters_r', null),
        new StimuliWord('s', 1, 'reading_letters_s', null),
        new StimuliWord('t', 1, 'reading_letters_t', null),
        new StimuliWord('u', 1, 'reading_letters_u', null),
        new StimuliWord('v', 1, 'reading_letters_v', null),
        new StimuliWord('w', 1, 'reading_letters_w', null),
        new StimuliWord('x', 1, 'reading_letters_x', null),
        new StimuliWord('y', 1, 'reading_letters_y', null),
        new StimuliWord('z', 1, 'reading_letters_z', null),
        new StimuliWord('å', 1, 'reading_letters_aa', null),
        new StimuliWord('ä', 1, 'reading_letters_ae', null),
        new StimuliWord('ö', 1, 'reading_letters_oe', null),
    ];
    public static getWordList(hasSound: boolean = false, hasImage: boolean = false, minLevel: number = 0,
        maxLevel: number = 999999999): Array<StimuliWord> {

        const list: Array<StimuliWord> = [];

        for (let i = 0; i < this.wordList.length; i++) {
            if (hasSound && this.wordList[i].hasSound === false) {
                continue;
            }
            if (hasImage && this.wordList[i].hasImage === false) {
                continue;
            }
            if (minLevel > 0 && this.wordList[i].difficultyLevel < minLevel) {
                continue;
            }
            if (this.wordList[i].difficultyLevel > maxLevel) {
                continue;
            }
            list.push(this.wordList[i]);
        }

        return list;
    }

    public static replaceAccented(word: string): string {

        word = word.split('å').join('aa');
        word = word.split('ä').join('ae');
        word = word.split('ö').join('oe');
        word = word.split('Å').join('aa');
        word = word.split('Ä').join('ae');
        word = word.split('Ö').join('oe');

        return word;
    }

    public static testList(): Array<StimuliWord> {

        const list: Array<StimuliWord> = [];

        // // Todo: Implement test
        // for (var i = 0; i < this.wordList.length; i++) {
        //     for (var j = i + 1; j < this.wordList.length; j++) {
        //         if (this.wordList[i].word == this.wordList[j].word) {
        //             if (this.wordList[j].hasImage) {
        //                 this.wordList[i].imagePath = this.wordList[j].imagePath;
        //             }
        //             if (this.wordList[j].hasSound) {
        //                 this.wordList[i].soundPath = this.wordList[j].soundPath;
        //             }
        //             this.wordList[i].difficultyLevel = Math.max(this.wordList[j].difficultyLevel, this.wordList[i].difficultyLevel);
        //             this.wordList.splice(j, 1);
        //             j--;
        //         }
        //     }
        //     console.log("new StimuliWord('" + this.wordList[i].word + "', " + this.wordList[i].difficultyLevel
        //          + ", '" + this.wordList[i].soundPath + "', '" + this.wordList[i].imagePath + "'),");
        // }
        /*for (var i:number = 0; i < this.wordList.length; i++){

            if(this.wordList[i].hasImage==true){
                if(AssetManager.instance.doesAssetExist("assets/wordpic/wordpic_"+replaceAccented(this.wordList[i].word))==false)
                    trace("test image:"+this.wordList[i].word +": does not exist");
//					new SimpleBitmap("assets/wordpic/wordpic_"+replaceAccented(wordList[i].word));
            }
            if(this.wordList[i].hasSound==true){
                trace("test sound:"+this.wordList[i].word)
                PopCode.instance.playSound(replaceAccented(this.wordList[i].word));
            }
        }*/

        return list;
    }

    public static getWord(word: string): StimuliWord {

        for (let i = 0; i < this.wordList.length; i++) {
            if (this.wordList[i].word === word) {
                return this.wordList[i];
            }
        }

        return null;
    }

    public static getWords(word: string[]): Array<StimuliWord> {
        const words: Array<StimuliWord> = [];
        for (let i = 0; i < word.length; i++) {
            words.push(this.getWord(word[i]));
        }

        return words;
    }

    public static getLetter(letter: string): StimuliWord {
        for (let i = 0; i < this.wordList.length; i++) {
            if (this.stimuliLetterList[i].word === letter) {
                return this.stimuliLetterList[i];
            }
        }

        return null;
    }

    public static getLetters(letters: string[]): Array<StimuliWord> {
        const stimuliLetters: Array<StimuliWord> = [];

        for (let i = 0; i < letters.length; i++) {
            stimuliLetters.push(this.getLetter(letters[i]));
        }

        return stimuliLetters;
    }

    public static getFullLetterList(): Array<string> {

        return this.letterList.slice(0);
    }
}
