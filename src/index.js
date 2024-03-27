const { default: axios } = require('axios');
const { transform } = require('camaro');
const { urlProvinsiBMKG, baseURL } = require('./helpers/values');
const { XMLParser } = require('fast-xml-parser');

const xml_parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ""
})

class BMKG {
    constructor() { }

    static infoGempa = async () => {
        const url = {
            gempa: baseURL.data + '/DataMKG/TEWS/autogempa.xml',
            image: baseURL.data + '/DataMKG/TEWS/',
        };
        const template = [
            'Infogempa/gempa',
            {
                tanggal: 'Tanggal',
                jam: 'Jam',
                lintang: 'Lintang',
                bujur: 'Bujur',
                magnitude: 'Magnitude',
                kedalaman: 'Kedalaman',
                potensi: 'Potensi',
                wilayah: 'Wilayah',
                dirasakan: 'Dirasakan',
                shakemap: 'Shakemap',
            },
        ];

        const { data } = await axios.get(url.gempa, { responseType: 'text' })
        const json = await transform(data, template)
        json[0].shakemap = url.image + json[0].shakemap;
        return json
    }

    /**
     * mengambil data nama kabupaten
     * @param {string} provinsi provinsi, contoh jawatengah (tanpa spasi)
     * @returns 
     */
    static Provinsi = async (provinsi) => {
        let find = urlProvinsiBMKG.find(x => x.provinsi.toLowerCase() == provinsi.toLowerCase())
        const { data } = await axios.get(find.url)

        return xml_parser.parse(data).data
    }

    /**
     * mengambil data nama kecamatan
     * @param {string} kabupaten nama kabupaten, contoh kab. magelang 
     * data harus sama persis dengan result pada Provinsi()
     * @returns 
     */
    static Kabupaten = async (kabupaten) => {
        const { data } = await axios.get(baseURL.dataWeb + '/API/cuaca/data-kecamatan.bmkg?kab=' + kabupaten.toLowerCase())
        let json = xml_parser.parse(data)
        if (json.data == '') {
            return []
        } else {
            return json.data.kec
        }
    }

    /**
     * 
     * @param {string} id id kecamatan
     * @returns 
     */
    static cuacaWeb = async (id) => {
        const { data } = await axios.get(baseURL.dataWeb + '/API/cuaca/cuaca-kecamatan.bmkg?id=' + id + '&detail=1')
        let json = xml_parser.parse(data)
        return json.cuaca_kecamatan
    }

    /**
     * 
     * @param {string} id id kecamatan
     * @returns 
     */
    static cuacaApp = async (id) => {
        const { data } = await axios.get(baseURL.dataApp + '/api/cuaca/kec-id/lengkap/' + id)
        return data
    }
}

module.exports = { BMKG, ...require('./helpers') }