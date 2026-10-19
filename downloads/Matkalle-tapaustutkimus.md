# Matkalle — reitistä oikeaan lippuun

Karine Heinosen itsenäinen UX/UI-portfoliokonsepti. Versio 0.1, 18.10.2026.

Matkalle on ensimmäinen tekoälyavusteinen konsepti ja toimiva verkkodemo. Siinä suunnitellaan yhtä asiointia: matkustaja valitsee reitin ja näkee, mikä esimerkkilippu siihen sopii ja miksi. Haastatteluja ja käytettävyystestejä ei ole vielä tehty, joten tässä tekstissä ei ole tutkimustuloksia.

Figma-prototyyppi: https://www.figma.com/design/rmlkjd0VnSlmzUqju4ktjN/Matkalle-%E2%80%94-UX-UI-portfoliokonsepti?node-id=0-1

Tiedoston katselu on avoin. Muokkaus edellyttää kirjautumista Figmaan.

Verkkodemo: https://karinehei.github.io/matkalle-figma/

## Lähtökohta

Konsepti on rajattu yhteen matkaan. Se on erillinen HSL:n virallisista palveluista, eikä HSL ole sitä tilannut.

Suunnitteluhypoteesi: satunnainen matkustaja voi tarvita apua reitin, vyöhykkeiden ja lipun yhdistämiseen. Hypoteesi on suunnittelun lähtökohta, ei tutkimustulos.

Tutkimuskysymys: ymmärtääkö käyttäjä ilman ulkopuolista apua, mikä lippu sopii valittuun esimerkkimatkaan ja miksi?

Käyttäjän tavoite: löytää tilanteeseen sopiva reitti, ymmärtää lipun kattavuus ja vahvistaa valinta luottavaisesti.

Liiketoiminnallinen hypoteesi: selkeästi perusteltu lipun valinta voisi vähentää keskeytyksiä ja virheellisiä valintoja. Tätä vaikutusta ei ole mitattu.

## Rooli

Projektin on tehnyt Karine Heinonen itsenäisenä portfoliotyönä. Ensimmäisen version käyttäjäpolku, käyttöliittymätekstit, visuaalinen luonnos, verkkodemon koodi ja tämän tekstin rakenne on luonnosteltu tekoälyn avulla. Julkaistu versio on tämä luonnos 0.1.

Mukana ei ole erillistä kehittäjätiimiä eikä tilaajaa. Käyttäjätutkimuksen osallistujia ei ole vielä rekrytoitu.

## Mitä demossa voi tehdä

Kuusi päävaihetta: reittihaku, vaihtoehdot, reitin tiedot, lipun valinta, yhteenveto ja demovahvistus. Haku on rajattu muutamaan esimerkkipaikkaan. Lisäksi mukana ovat suosikkimatkat, jaettava reittisuunnitelma ja maksun virhetilanne.

Reitit, linjat, aikataulut, hinnat ja lipun voimassaoloajat ovat esimerkkejä. Kartta on kaavio. Maksu on simuloitu: demossa ei synny oikeaa lippua eikä veloitusta. Kirjautumista, live-liikennedataa ja HSL-integraatiota ei ole. Jaettava linkki näyttää, miten sama reittisuunnitelma avautuu toisessa selaimessa. Se ei ole HSL-tilin tai sovelluksen integraatio.

## Suunnitteluvaihtoehdot

Luonnoksessa on toteutettu vaihtoehto A: reittivaihtoehdot näytetään ensin, ja lipun perustelu on omassa vaiheessaan. Ajatus on, että päätöksiä voi jäsentää vaiheittain.

Vertailtavaksi on hahmoteltu vaihtoehto B: kunkin reittikortin yhteydessä näytettäisiin lipun vyöhyke ja esimerkkihinta. Ajatus on, että käyttäjä arvioisi matkaa reitin ja kustannuksen yhdistelmänä. Vaihtoehtoa B ei ole rakennettu prototyyppiin, eikä kumpaakaan vaihtoehtoa ole vielä arvioitu käyttäjien kanssa. Siksi tässä ei sanota, kumpi tukee päätöksentekoa paremmin.

## Tutkimuksen tila

Haastattelut ja käytettävyystestit on suunniteltu, mutta niitä ei ole tehty. Tavoitteena on myöhemmin 3–5 ihmistä, joilla on erilainen kokemus seudulla liikkumisesta. Pieni otos voi auttaa huomaamaan ongelmia. Se ei kerro, miten yleisiä ongelmat ovat.

Suunnitelluissa tehtävissä osallistuja etsisi matkan Pasilasta Meilahteen, vaihtoehdon jossa kävelyä on vähän, sekä lentoasemalle suuntautuvan matkan ja selittäisi lipun kattavuuden eron. Lisäksi katsottaisiin maksun virhetilannetta ja tallennetun matkan löytämistä. Näitä tehtäviä ei ole vielä tehty, joten havaintoja, aikoja tai helppousarvioita ei ole.

## Saavutettavuus

Tarkistettavaksi on kirjattu koko polku näppäimistöllä, otsikot ja kohdistus näkymän vaihtuessa, lomakkeiden nimet, virheilmoitukset, reitin ymmärtäminen ilman karttaa ja värejä, 200 % zoomaus, 320 CSS-pikselin leveys, ruudunlukija sekä kontrastit ja kosketusalueet.

Lista on tarkistuslista. Se ei ole todistus siitä, että demo olisi saavutettava. Figma-luonnos ei kerro, miten verkkodemo toimii ruudunlukijalla. Verkkodemo ei kerro, miltä sama asia tuntuisi oikeassa sovelluksessa.

## Analytiikka demossa

Testitapahtumien keruu on vapaaehtoinen ja oletuksena pois päältä. Sen voi käynnistää Portfolion testityökalut -osiosta. Tapahtumat näkyvät vain samassa selainvälilehdessä, ja ne voi ladata JSON-tiedostona. Demossa ei ole erillistä analytiikkapalvelua.

Mukana olevat tapahtumat: haku, reitin valinta, lipun valinta, vaiheen avaus, näkymän vaihto, demomaksun epäonnistuminen ja onnistuminen sekä suosikiksi tallennus. Tapahtumajono on tarkoitettu ohjattujen testien tueksi. Se ei yksin selitä, miksi käyttäjä toimi niin kuin toimi. Omia kehityskokeiluja ei pidä lukea asiakasanalytiikkana.

## Tekoälyn käyttö

| Päivä | Työ | Ehdotuksen ydin | Tila |
|---|---|---|---|
| 18.10.2026 | Tekoälyavusteinen ensimmäinen luonnos | Kuusi näkymää, vaiheittainen lipun valinta, esimerkkidata | Luonnos arvioitavana. Käyttäjätestejä ei ole tehty. |

## Rajat

Tuloksia ei vielä ole, koska testejä ei ole tehty. Kun testit tehdään, otos on pieni, data on esimerkkejä ja tilanne on testitilanne. Sellaista vertailua ei voi yleistää kaikkien matkustajien käyttäytymiseen.

Seuraava tekninen mahdollisuus olisi oikea reitti- ja vyöhykedata HSL:n avoimen datan käyttöehtojen mukaan. Se ei kuulu tähän versioon.
