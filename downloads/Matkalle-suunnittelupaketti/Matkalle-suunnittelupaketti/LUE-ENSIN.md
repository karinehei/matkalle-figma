# Matkalle — Figma-suunnittelupaketti

Versio 0.1 · 18.10.2026 · Karine Heinosen itsenäinen UX/UI-portfoliokonsepti.

## Avaa muokattava Figma-prototyyppi

https://www.figma.com/design/rmlkjd0VnSlmzUqju4ktjN?node-id=3-594

Tiedostossa on kuusi päävaihetta, maksun virhetila, Auto Layout -näkymät, Simple Design Systemin Button- ja Input Field -instanssit, omat muokattavat korttikomponentit sekä Matkallen väri-, välistys- ja tekstityylit. Pääpolun lähtöpiste ja 12 prototyyppilinkkiä on asetettu. Rakenteesta on tarkistettu muokattavat tekstit ja instanssit, Inter-fontti sekä koko näkymän kuvakaappaus. Esitystilan klikkauksia ei ole vielä testattu selaimessa.

1. Avaa tiedosto omalla Figma-tililläsi.
2. Valitse ensimmäinen Reittihaku-frame.
3. Käynnistä prototyyppiesitys yläreunan Present / ▶ -painikkeesta.
4. Seuraa pääpolkua: esitäytetty haku → ensimmäinen reitti → reitin tiedot → kertalippu AB → yhteenveto → demovahvistus.

Vaihtoehtoiset reitti- ja lippuvalinnat ovat Figma-luonnoksessa staattisia visuaalisia esimerkkejä. Verkkodemossa valinnat ovat toimivia. Figma-luonnos ei ole natiivisovellustoteutus.

## Paketin sisältö

- svg/: kuusi päävaihetta ja maksun virhetila SVG-tiedostoina.
- design-tokens.json: konseptin väri-, typografia- ja välistysmäärittelyt.
- screens.json: näkymien sisällön rakenteellinen kuvaus.
- Matkalle-tapaustutkimus.md: julkinen kuvaus konseptista, rajauksesta, suunnitteluvaihtoehdoista ja siitä, mitä ei ole vielä testattu.

SVG-kuvat voi vetää tyhjään Figma Design -tiedostoon. SVG-tuonti ei luo Auto Layoutia, komponenttisidoksia tai prototyyppilinkkejä; käytä valmista Figma-tiedostoa niiden muokkaamiseen. SVG-kuvat ovat saman sisällön erillinen visualisointi, eivät viennit valmiista Figma-tiedostosta.

## Suunnittelun tila

Ensimmäinen versio on tekoälyavusteinen luonnos. Oikeita haastatteluja ja käytettävyystestejä ei ole vielä tehty. Käyttäjälausuntoja tai käytettävyyden parannuksia ei ole kirjattu.

Kaikki reitit, linjat, aikataulut, vyöhykkeiden havainnollistukset, hinnat ja voimassaoloajat ovat esimerkkidataa. Ei HSL:n tilaama tai virallinen HSL-palvelu. Maksaminen on simuloitu.
