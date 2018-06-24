 
export class RegionalDivisionsType {
    public static Type = [
        { Id: 0, Name: 'منطقه' },
        { Id: 1, Name: 'کشور' },
        { Id: 2, Name: 'استان' },
        { Id: 3, Name: 'شهر' }
    ]
}


// ************** Employee ****************
export class EmployeeGenders {
    public static Genders = [
        { Id: 1, Name: 'مرد' },
        { Id: 2, Name: 'زن' }
    ]
};


// ************** Employee Templates ****************
export enum TemplateTypes {
    Fingerprint = 1,
    Card = 2,
    Tag = 3,
    Face = 4
}

export enum CarPlateTypes {
    Personal = 1,
    Organization = 2,
    Government = 3,
}

export class FingerType {
    public static Types = [
        {
            Id: 0,
            Name: { Fa: 'نامشخص', En: 'Unknown' }
        },
        {
            Id: 1,
            Name: { Fa: 'شست دست راست', En: 'Right thumb' }
        },
        {
            Id: 2,
            Name: { Fa: 'اشاره دست راست', En: 'Right index' }
        },
        {
            Id: 3,
            Name: { Fa: 'میانی دست راست', En: 'Right middle' }
        },
        {
            Id: 4,
            Name: { Fa: 'حلقه دست راست', En: 'Right ring' }
        },
        {
            Id: 5,
            Name: { Fa: 'کوچک دست راست', En: 'Right pinky' }
        },
        {
            Id: 6,
            Name: { Fa: 'شست دست چپ', En: 'Left thumb' }
        },
        {
            Id: 7,
            Name: { Fa: 'اشاره دست چپ', En: 'Left index' }
        },
        {
            Id: 8,
            Name: { Fa: 'میانی دست چپ', En: 'Left middle' }
        },
        {
            Id: 9,
            Name: { Fa: 'حلقه دست چپ', En: 'Left ring' }
        },
        {
            Id: 10,
            Name: { Fa: 'کوچک دست چپ', En: 'Left pinky' }
        }
    ];
}

export class FingerIndices {

    public RightThumb = 1;
    public RightIndex = 2;
    public RightMiddle = 3;
    public RightRing = 4;
    public RightPinky = 5;

    public LeftThumb = 6;
    public LeftIndex = 7;
    public LeftMiddle = 8;
    public LeftRing = 9;
    public LeftPinky = 10;
}

export class EmployeeTemplate {

    public DatabaseId: string = null;

    public TemplateDataBase64: string;
    public TemplateType: number;

    public CardOrTagString: string;

    public FingerIndex: number;

    public PlateNumber: string;
    public PlateType: number;
    public CarModel: string;

    private Guid: string;
    getGuid(): string {
        return this.Guid;
    }

    
    public json(): any {
        return {
            "DatabaseId": this.DatabaseId,
            "TemplateDataBase64": this.TemplateDataBase64,
            "CardOrTagString": this.CardOrTagString,
            "TemplateType": this.TemplateType,
            "PlateNumber": this.PlateNumber,
            "PlateType": this.PlateType,
            "CarModel": this.CarModel,
            "FingerIndex": this.FingerIndex
        };
    }

    public fromJson(jsonObject: any): void {
        this.DatabaseId = jsonObject.DatabaseId;
        this.TemplateDataBase64 = jsonObject.TemplateDataBase64;
        this.CardOrTagString = jsonObject.CardOrTagString;
        this.TemplateType = jsonObject.TemplateType;
        this.PlateNumber = jsonObject.PlateNumber;
        this.PlateType = jsonObject.PlateType;
        this.CarModel = jsonObject.CarModel;
        this.FingerIndex = jsonObject.FingerIndex;
    }

}


// ************** Devices ****************
export class DeviceModels {
    public static Models = [
        { Id: 1000, Name: "B2_BioStationL2" },
        { Id: 1001, Name: "B2_BioStationA2" },
        { Id: 1002, Name: "B2_BioStation2" },
        { Id: 1003, Name: "B2_FaceStation2" },
        { Id: 1004, Name: "B2_BioEntry2" },
        { Id: 1005, Name: "B2_BioEntryPlus" },
        { Id: 1006, Name: "B2_BioEntryW" },
        { Id: 1007, Name: "B2_BioLiteNet" },


        { Id: 500, Name: "B1_BioStation" },
        { Id: 501, Name: "B2_BioStationT2" },
        { Id: 502, Name: "B1_BIOENTRY_PLUS" },
        { Id: 503, Name: "B1_BIOLITE" },
        { Id: 504, Name: "B1_XPASS" },
        { Id: 505, Name: "B1_DSTATION" },
        { Id: 506, Name: "B1_XSTATION" },
        { Id: 507, Name: "B1_BIOSTATION2" },
        { Id: 508, Name: "B1_XPASS_SLIM" },
        { Id: 509, Name: "B1_FSTATION" },
        { Id: 510, Name: "B1_BIOENTRY_W" },
        { Id: 511, Name: "B1_XPASS_SLIM2" },

    ];
}

export class DeviceMatchingModes {
    public static MatchingModes = [
        { Id: 0, Name: "سرور به دستگاه" },
        { Id: 1, Name: "دستگاه به سرور" }
    ]
}

export class DeviceEntranceModes {
    public static EntranceModes = [
        { Id: 1, Name: "ورود" },
        { Id: 2, Name: "خروج" },
        { Id: 3, Name: "ورودی پارکینگ" },
        { Id: 4, Name: "خروجی پارکینگ" },
        { Id: 5, Name: "ورود/خروج" }
    ]
}

// ************** Time Zone ****************
export class Timezones {
    public static Zones = [
        { Offset: "-12:00", Name: "(GMT-12:00) International Date Line West" },
        { Offset: "-11:00", Name: "(GMT-11:00) Midway Island, Samoa" },
        { Offset: "-10:00", Name: "(GMT-10:00) Hawaii" },
        { Offset: "-09:00", Name: "(GMT-09:00) Alaska" },
        { Offset: "-08:00", Name: "(GMT-08:00) Pacific Time (US and Canada); Tijuana" },
        { Offset: "-07:00", Name: "(GMT-07:00) Mountain Time (US and Canada)" },
        { Offset: "-07:00", Name: "(GMT-07:00) Chihuahua, La Paz, Mazatlan" },
        { Offset: "-07:00", Name: "(GMT-07:00) Arizona" },
        { Offset: "-06:00", Name: "(GMT-06:00) Central Time (US and Canada" },
        { Offset: "-06:00", Name: "(GMT-06:00) Saskatchewan" },
        { Offset: "-06:00", Name: "(GMT-06:00) Guadalajara, Mexico City, Monterrey" },
        { Offset: "-06:00", Name: "(GMT-06:00) Central America" },
        { Offset: "-05:00", Name: "(GMT-05:00) Eastern Time (US and Canada)" },
        { Offset: "-05:00", Name: "(GMT-05:00) Indiana (East)" },
        { Offset: "-05:00", Name: "(GMT-05:00) Bogota, Lima, Quito" },
        { Offset: "-04:00", Name: "(GMT-04:00) Atlantic Time (Canada)" },
        { Offset: "-04:00", Name: "(GMT-04:00) Caracas, La Paz" },
        { Offset: "-04:00", Name: "(GMT-04:00) Santiago" },
        { Offset: "-03:30", Name: "(GMT-03:30) Newfoundland and Labrador" },
        { Offset: "-03:00", Name: "(GMT-03:00) Brasilia" },
        { Offset: "-03:00", Name: "(GMT-03:00) Buenos Aires, Georgetown" },
        { Offset: "-03:00", Name: "(GMT-03:00) Greenland" },
        { Offset: "-02:00", Name: "(GMT-02:00) Mid-Atlantic" },
        { Offset: "-01:00", Name: "(GMT-01:00) Azores" },
        { Offset: "-01:00", Name: "(GMT-01:00) Cape Verde Islands" },
        { Offset: "00:00", Name: "Greenwich Mean Time: Dublin, Edinburgh, Lisbon, London" },
        { Offset: "00:00", Name: "Casablanca, Monrovia" },
        { Offset: "+01:00", Name: "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague" },
        { Offset: "+01:00", Name: "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb" },
        { Offset: "+01:00", Name: "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris" },
        { Offset: "+01:00", Name: "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna" },
        { Offset: "+01:00", Name: "(GMT+01:00) West Central Africa" },
        { Offset: "+02:00", Name: "(GMT+02:00) Bucharest" },
        { Offset: "+02:00", Name: "(GMT+02:00) Cairo" },
        { Offset: "+02:00", Name: "(GMT+02:00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius" },
        { Offset: "+02:00", Name: "(GMT+02:00) Athens, Istanbul, Minsk" },
        { Offset: "+02:00", Name: "(GMT+02:00) Jerusalem" },
        { Offset: "+02:00", Name: "(GMT+02:00) Harare, Pretoria" },
        { Offset: "+03:00", Name: "(GMT+03:00) Moscow, St. Petersburg, Volgograd" },
        { Offset: "+03:00", Name: "(GMT+03:00) Kuwait, Riyadh" },
        { Offset: "+03:00", Name: "(GMT+03:00) Nairobi" },
        { Offset: "+03:00", Name: "(GMT+03:00) Baghdad" },
        { Offset: "+03:30", Name: "(GMT+03:30) Tehran" },
        { Offset: "+04:00", Name: "(GMT+04:00) Abu Dhabi, Muscat" },
        { Offset: "+04:00", Name: "(GMT+04:00) Baku, Tbilisi, Yerevan" },
        { Offset: "+04:30", Name: "(GMT+04:30) Kabul" },
        { Offset: "+05:00", Name: "(GMT+05:00) Ekaterinburg" },
        { Offset: "+05:00", Name: "(GMT+05:00) Islamabad, Karachi, Tashkent" },
        { Offset: "+05:30", Name: "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi" },
        { Offset: "+05:45", Name: "(GMT+05:45) Kathmandu" },
        { Offset: "+06:00", Name: "(GMT+06:00) Astana, Dhaka" },
        { Offset: "+06:00", Name: "(GMT+06:00) Sri Jayawardenepura" },
        { Offset: "+06:00", Name: "(GMT+06:00) Almaty, Novosibirsk" },
        { Offset: "+06:30", Name: "(GMT+06:30) Yangon Rangoon" },
        { Offset: "+07:00", Name: "(GMT+07:00) Bangkok, Hanoi, Jakarta" },
        { Offset: "+07:00", Name: "(GMT+07:00) Krasnoyarsk" },
        { Offset: "+08:00", Name: "(GMT+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi" },
        { Offset: "+08:00", Name: "(GMT+08:00) Kuala Lumpur, Singapore" },
        { Offset: "+08:00", Name: "(GMT+08:00) Taipei" },
        { Offset: "+08:00", Name: "(GMT+08:00) Perth" },
        { Offset: "+08:00", Name: "(GMT+08:00) Irkutsk, Ulaanbaatar" },
        { Offset: "+09:00", Name: "(GMT+09:00) Seoul" },
        { Offset: "+09:00", Name: "(GMT+09:00) Osaka, Sapporo, Tokyo" },
        { Offset: "+09:00", Name: "(GMT+09:00) Yakutsk" },
        { Offset: "+09:30", Name: "(GMT+09:30) Darwin" },
        { Offset: "+09:30", Name: "(GMT+09:30) Adelaide" },
        { Offset: "+10:00", Name: "(GMT+10:00) Canberra, Melbourne, Sydney" },
        { Offset: "+10:00", Name: "(GMT+10:00) Brisbane" },
        { Offset: "+10:00", Name: "(GMT+10:00) Hobart" },
        { Offset: "+10:00", Name: "(GMT+10:00) Vladivostok" },
        { Offset: "+10:00", Name: "(GMT+10:00) Guam, Port Moresby" },
        { Offset: "+11:00", Name: "(GMT+11:00) Magadan, Solomon Islands, New Caledonia" },
        { Offset: "+12:00", Name: "(GMT+12:00) Fiji Islands, Kamchatka, Marshall Islands" },
        { Offset: "+12:00", Name: "(GMT+12:00) Auckland, Wellington" },
        { Offset: "+13:00", Name: "(GMT+13:00) Nuku'alofa" }
    ]
}
