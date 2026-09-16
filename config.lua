Config = {}
Config.OpenKey = 'M'
Config.Command = 'clmap'
Config.GamepadSupport = true
Config.Blur = true
Config.Sounds = true
Config.Scanlines = true
Config.Hints = true
Config.Theme = 'light'
Config.Style = 'atlas'
Config.Zoom = 4
Config.Debug = false

Config.Appearance = {
    blueEffect = true,
    blueColor = '#086A9C',
    blueOpacity = 0.38,
    panelColor = '#093C57',
    panelOpacity = 0.70,
    accentColor = '#74E4F0',
}

Config.Map = {
    tiles = {
        atlas     = 'https://s.rsg.sc/sc/images/games/GTAV/map/print/{z}/{x}/{y}.jpg',
        dark      = 'https://s.rsg.sc/sc/images/games/GTAV/map/game/{z}/{x}/{y}.jpg',
        satellite = 'https://s.rsg.sc/sc/images/games/GTAV/map/render/{z}/{x}/{y}.jpg',
    },
    minZoom = 3.25,
    maxZoom = 7,
    transform = { 0.01423702, 58.85859, -0.01424839, 119.4973 },
    nightStart = 20,
    nightEnd = 6,
    ignoreSprites = { [0] = true, [1] = true, [2] = true, [3] = true, [4] = true, [5] = true, [8] = true, [9] = true, [11] = true, [161] = true, [162] = true, [163] = true, [164] = true, [165] = true },
    hideAutoBlips = false,
    categoryOrder = { 'Government', 'Jobs', 'Services', 'Shops', 'Locations' },
    categories = {
        [60] = 'Government', [61] = 'Government', [188] = 'Government', [942] = 'Government', [407] = 'Government',
        [475] = 'Government', [235] = 'Government', [893] = 'Government', [526] = 'Government', [137] = 'Government',
        [67] = 'Jobs', [68] = 'Jobs', [198] = 'Jobs', [318] = 'Jobs', [477] = 'Jobs', [473] = 'Jobs', [846] = 'Jobs',
        [141] = 'Jobs', [513] = 'Jobs', [677] = 'Jobs', [911] = 'Jobs', [501] = 'Jobs', [940] = 'Jobs', [795] = 'Jobs',
        [356] = 'Jobs', [410] = 'Jobs', [267] = 'Jobs', [479] = 'Jobs', [365] = 'Jobs',
        [108] = 'Services', [357] = 'Services', [361] = 'Services', [72] = 'Services', [402] = 'Services', [446] = 'Services',
        [100] = 'Services', [138] = 'Services', [360] = 'Services', [817] = 'Services', [40] = 'Services', [374] = 'Services',
        [63] = 'Services', [36] = 'Services', [350] = 'Services', [369] = 'Services', [476] = 'Services', [375] = 'Services',
        [474] = 'Services', [810] = 'Services', [50] = 'Services', [359] = 'Services', [455] = 'Services',
        [52] = 'Shops', [73] = 'Shops', [71] = 'Shops', [75] = 'Shops', [110] = 'Shops', [313] = 'Shops', [93] = 'Shops',
        [326] = 'Shops', [225] = 'Shops', [831] = 'Shops', [830] = 'Shops', [111] = 'Shops', [311] = 'Shops', [500] = 'Shops',
        [679] = 'Shops', [740] = 'Shops', [121] = 'Shops', [135] = 'Shops', [136] = 'Shops', [99] = 'Shops', [102] = 'Shops',
        [142] = 'Shops', [95] = 'Shops', [119] = 'Shops', [266] = 'Shops', [362] = 'Shops', [925] = 'Shops', [889] = 'Shops',
        [197] = 'Shops', [122] = 'Shops', [103] = 'Shops', [109] = 'Shops', [85] = 'Shops', [928] = 'Shops', [671] = 'Shops',
        [819] = 'Shops', [827] = 'Shops', [843] = 'Shops', [106] = 'Shops',
    },
    spriteNames = {
        [60] = 'Police Department', [137] = 'Police Department', [61] = 'Hospital', [188] = 'Jail', [942] = 'Fire Department',
        [407] = 'Information', [475] = 'Office', [235] = 'Park Ranger', [893] = 'Bail Bonds', [526] = 'Police Dropoff',
        [67] = 'Security Depot', [68] = 'Tow Truck', [198] = 'Taxi', [318] = 'Garbage Depot', [477] = 'Trucking',
        [473] = 'Warehouse', [846] = 'Farm', [141] = 'Hunting', [513] = 'Bus Depot', [677] = 'Shipping', [911] = 'Cargo Ship',
        [501] = 'Delivery', [940] = 'Medical Courier', [795] = 'Train Station', [356] = 'Docks', [410] = 'Boat Rental',
        [267] = 'Property', [479] = 'Trailer', [365] = 'Pickup',
        [108] = 'Bank', [357] = 'Garage', [361] = 'Gas Station', [72] = 'Customs', [402] = 'Repair Shop', [446] = 'Mechanic',
        [100] = 'Car Wash', [138] = 'Airport', [360] = 'Helipad', [817] = 'Payphone', [40] = 'Safehouse', [374] = 'Business',
        [63] = 'Elevator', [36] = 'Cable Car', [350] = 'Property For Sale', [369] = 'Garage For Sale', [476] = 'Office For Sale',
        [375] = 'Business For Sale', [474] = 'Warehouse For Sale', [810] = 'Vehicle For Sale', [50] = 'Impound Lot',
        [359] = 'Hangar', [455] = 'Yacht',
        [52] = '24/7 Store', [73] = 'Clothing Store', [71] = 'Barber', [75] = 'Tattoo Parlor', [110] = 'Ammu-Nation',
        [313] = 'Shooting Range', [93] = 'Bar', [326] = 'Car Dealership', [225] = 'Vehicle Shop', [831] = 'Showroom',
        [830] = 'Luxury Showroom', [111] = 'Internet Cafe', [311] = 'Gym', [500] = 'Money Wash', [679] = 'Casino',
        [740] = 'Arcade', [121] = 'Strip Club', [135] = 'Cinema', [136] = 'Music Venue', [99] = 'Cabaret Club',
        [102] = 'Comedy Club', [142] = 'Pool', [95] = 'Basketball', [119] = 'Shooting Range', [266] = 'Fairground',
        [362] = 'Mask Shop', [925] = 'Smoke Shop', [889] = 'Pizza', [197] = 'Yoga', [122] = 'Tennis', [103] = 'Darts',
        [109] = 'Golf Course', [85] = 'Tours', [928] = 'Heli Tours', [671] = 'Comic Store', [819] = 'Music Studio',
        [827] = 'Biker Bar', [843] = 'Cab Company', [106] = 'Convenience Store', [280] = 'Friend', [162] = 'Point Of Interest',
    },
    locations = {
        { id = 'cityhall',    name = 'City Hall',           category = 'Government', sprite = 475, color = 2,  coords = vector3(-544.2, -204.6, 38.2) },
        { id = 'courthouse',  name = 'Courthouse Clerk',    category = 'Government', sprite = 407, color = 5,  coords = vector3(-529.5, -186.9, 38.2) },
        { id = 'dmv',         name = 'DMV',                 category = 'Government', sprite = 225, color = 0,  coords = vector3(240.9, -1380.1, 33.7) },
        { id = 'hospital',    name = 'Hospital',            category = 'Government', sprite = 61,  color = 2,  coords = { vector3(308.2, -595.4, 43.3), vector3(1839.6, 3672.9, 34.3), vector3(-247.8, 6331.3, 32.4) } },
        { id = 'jail',        name = 'Jail',                category = 'Government', sprite = 188, color = 3,  coords = vector3(1845.9, 2585.9, 45.7) },
        { id = 'ranger',      name = 'Park Ranger',         category = 'Government', sprite = 235, color = 25, coords = vector3(378.6, 792.4, 187.8) },
        { id = 'police',      name = 'Police Department',   category = 'Government', sprite = 60,  color = 29, coords = { vector3(428.2, -984.3, 30.7), vector3(1852.4, 3689.0, 34.3), vector3(-448.1, 6012.6, 31.7) } },
        { id = 'bilgeco',     name = 'Bilgeco Shipping',    category = 'Jobs',       sprite = 677, color = 1,  coords = vector3(1223.8, -3115.7, 5.5) },
        { id = 'butcher',     name = 'Butcher',             category = 'Jobs',       sprite = 141, color = 0,  coords = vector3(-73.2, 6260.9, 31.1) },
        { id = 'cypress',     name = 'Cypress Flats Depot', category = 'Jobs',       sprite = 477, color = 5,  coords = { vector3(869.4, -2107.3, 30.5), vector3(1204.9, -3115.5, 5.5) } },
        { id = 'farm',        name = 'Farm Contact',        category = 'Jobs',       sprite = 846, color = 0,  coords = vector3(2028.9, 4979.4, 41.1) },
        { id = 'garbage',     name = 'Garbage Depot',       category = 'Jobs',       sprite = 318, color = 2,  coords = vector3(-321.7, -1546.1, 31.0) },
        { id = 'garbagedrop', name = 'Garbage Dropoff',     category = 'Jobs',       sprite = 318, color = 1,  coords = vector3(-347.6, -1560.9, 25.2) },
        { id = 'golf',        name = 'Golf Course',         category = 'Jobs',       sprite = 109, color = 2,  coords = vector3(-1329.4, 57.5, 53.5) },
    },
}

Config.Strings = {
    quick_menu      = 'Quick Menu',
    locations       = 'Locations',
    you             = 'You',
    search          = 'Search...',
    search_binds    = 'Search bindings... (key: to search by key)',
    move            = 'Move',
    select          = 'Select',
    resume          = 'Resume',
    back            = 'Back',
    exit            = 'Exit',
    change          = 'Change',
    tab             = 'Tab',
    set_waypoint    = 'Set Waypoint',
    prev_blip       = 'Prev Blip',
    next_blip       = 'Next Blip',
    cycle_blip      = 'Cycle Blip',
    zoom            = 'Zoom',
    toggle_blip     = 'Toggle Blip',
    unbind          = 'Unbind',
    achievements    = 'Achievements',
    unlocked        = 'Unlocked',
    locked          = 'Locked',
    points          = 'Points',
    disconnect_title = 'Exit To Desktop',
    disconnect_text  = 'Are you sure you want to disconnect from the server?',
    disconnect_yes   = 'Disconnect',
    disconnect_no    = 'Cancel',
    keybind_hint     = 'GTA does not expose a native binding replacement API to this menu.',
    achievement_unlocked = 'Achievement Unlocked',
    players_online   = 'Players Online',
    player_id        = 'ID',
    no_results       = 'No results',
    unassigned       = '—',
}
