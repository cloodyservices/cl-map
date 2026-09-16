PM = PM or {}

local KVP_HIDDEN  = 'cl_map_hidden'
local mapActive   = false
local hiddenKeys  = {}
local runtimeLocs = {}
local colourCache = {}
local MAX_SPRITE  = 965

do
    local raw = GetResourceKvpString(KVP_HIDDEN)
    if raw and raw ~= '' then
        local ok, t = pcall(json.decode, raw)
        if ok and type(t) == 'table' then
            for k, v in pairs(t) do
                if v then hiddenKeys[tostring(k)] = true end
            end
        end
    end
end

local function saveHidden()
    SetResourceKvp(KVP_HIDDEN, json.encode(hiddenKeys))
end

function PM.GetMapConfig()
    return {
        tiles      = Config.Map.tiles,
        minZoom    = Config.Map.minZoom,
        maxZoom    = Config.Map.maxZoom,
        transform  = Config.Map.transform,
        categories = Config.Map.categoryOrder,
    }
end

local function colourToRgb(colour)
    if type(colour) == 'table' then
        return { colour.r or colour[1] or 255, colour.g or colour[2] or 255, colour.b or colour[3] or 255 }
    end
    colour = tonumber(colour) or 0
    if colourCache[colour] then return colourCache[colour] end
    local tmp = AddBlipForCoord(0.0, 0.0, 0.0)
    SetBlipColour(tmp, colour)
    local hud = GetBlipHudColour(tmp)
    RemoveBlip(tmp)
    local r, g, b = GetHudColour(hud)
    colourCache[colour] = { r, g, b }
    return colourCache[colour]
end

local function zoneInfo(x, y, z)
    local zone  = GetNameOfZone(x, y, z)
    local label = GetLabelText(zone)
    if label == 'NULL' or label == '' then label = zone end
    local s1, s2 = GetStreetNameAtCoord(x, y, z)
    local street = s1 ~= 0 and GetStreetNameFromHashKey(s1) or ''
    local cross  = s2 ~= 0 and GetStreetNameFromHashKey(s2) or nil
    if cross == '' then cross = nil end
    return label, street, cross
end

local function getWaypoint()
    if not IsWaypointActive() then return false end
    local blip = GetFirstBlipInfoId(8)
    if not DoesBlipExist(blip) then return false end
    local c = GetBlipCoords(blip)
    return { x = c.x, y = c.y }
end

local function isNight()
    local h = GetClockHours()
    return h >= Config.Map.nightStart or h < Config.Map.nightEnd
end

local function playerState()
    local ped = PlayerPedId()
    local c = GetEntityCoords(ped)
    local zone, street, cross = zoneInfo(c.x, c.y, c.z)
    return { x = c.x, y = c.y, heading = GetEntityHeading(ped), zone = zone, street = street, cross = cross }
end

local function manualLocations()
    local list = {}
    for _, loc in ipairs(Config.Map.locations or {}) do list[#list + 1] = loc end
    for _, loc in pairs(runtimeLocs) do list[#list + 1] = loc end
    return list
end

local function toPoints(coords)
    local pts = {}
    if type(coords) == 'vector3' or type(coords) == 'vector2' or type(coords) == 'vector4' or coords.x then
        pts[1] = { x = coords.x + 0.0, y = coords.y + 0.0 }
    else
        for _, c in ipairs(coords) do
            pts[#pts + 1] = { x = c.x + 0.0, y = c.y + 0.0 }
        end
    end
    return pts
end

local function collectAutoBlips(manual)
    local out = {}
    if Config.Map.hideAutoBlips then return out end
    local ignore   = Config.Map.ignoreSprites or {}
    local hudCache = {}

    for sprite = 1, MAX_SPRITE do
        if not ignore[sprite] then
            local blip = GetFirstBlipInfoId(sprite)
            while DoesBlipExist(blip) do
                if GetBlipInfoIdDisplay(blip) ~= 0 and GetBlipAlpha(blip) > 0 then
                    local c   = GetBlipCoords(blip)
                    local hud = GetBlipHudColour(blip)
                    local rgb = hudCache[hud]
                    if not rgb then
                        local r, g, b = GetHudColour(hud)
                        rgb = { r, g, b }
                        hudCache[hud] = rgb
                    end
                    local dup = false
                    for _, m in ipairs(manual) do
                        if m.sprite == sprite then
                            for _, p in ipairs(m.points) do
                                if math.abs(p.x - c.x) < 80.0 and math.abs(p.y - c.y) < 80.0 then dup = true break end
                            end
                        end
                        if dup then break end
                    end
                    if not dup then
                        out[#out + 1] = { sprite = sprite, x = c.x, y = c.y, color = rgb }
                    end
                end
                blip = GetNextBlipInfoId(sprite)
            end
        end
    end
    return out
end

local function buildEntries()
    local entries = {}
    local manual  = {}

    for _, loc in ipairs(manualLocations()) do
        local key = 'loc:' .. tostring(loc.id or loc.name)
        local entry = {
            key = key, name = loc.name, category = loc.category or 'Locations',
            sprite = loc.sprite or 1, color = colourToRgb(loc.color), points = toPoints(loc.coords),
            manual = true, hidden = hiddenKeys[key] or false,
        }
        entries[#entries + 1] = entry
        manual[#manual + 1] = entry
    end

    local groups = {}
    for _, b in ipairs(collectAutoBlips(manual)) do
        local key = ('auto:%d:%d,%d,%d'):format(b.sprite, b.color[1], b.color[2], b.color[3])
        local g = groups[key]
        if not g then
            g = {
                key = key, sprite = b.sprite, color = b.color, points = {},
                category = Config.Map.categories[b.sprite] or 'Locations',
                name = Config.Map.spriteNames[b.sprite],
                hidden = hiddenKeys[key] or false,
            }
            groups[key] = g
            entries[#entries + 1] = g
        end
        g.points[#g.points + 1] = { x = b.x, y = b.y }
    end
    return entries
end

function PM.SendMapData()
    SendNUIMessage({
        action   = 'mapData',
        entries  = buildEntries(),
        waypoint = getWaypoint(),
        player   = playerState(),
        night    = isNight(),
    })
end

function PM.MapOpened()
    if mapActive then return end
    mapActive = true
    PM.SendMapData()
    CreateThread(function()
        while mapActive do
            SendNUIMessage({ action = 'mapPlayer', player = playerState(), waypoint = getWaypoint(), night = isNight() })
            Wait(250)
        end
    end)
end

function PM.MapClosed()
    mapActive = false
end

RegisterNUICallback('mapWaypoint', function(data, cb)
    local x, y = tonumber(data.x), tonumber(data.y)
    if x and y then
        SetNewWaypoint(x + 0.0, y + 0.0)
    end
    cb(getWaypoint())
end)

RegisterNUICallback('mapRemoveWaypoint', function(_, cb)
    SetWaypointOff()
    DeleteWaypoint()
    cb(1)
end)

RegisterNUICallback('mapHover', function(data, cb)
    local x, y = tonumber(data.x), tonumber(data.y)
    if not x or not y then return cb(false) end
    local zone, street, cross = zoneInfo(x + 0.0, y + 0.0, 30.0)
    cb({ zone = zone, street = street, cross = cross })
end)

RegisterNUICallback('mapToggle', function(data, cb)
    if data.key then
        if data.hidden then hiddenKeys[data.key] = true else hiddenKeys[data.key] = nil end
        saveHidden()
    end
    cb(1)
end)

RegisterNUICallback('mapRefresh', function(_, cb)
    if mapActive then PM.SendMapData() end
    cb(1)
end)

local function addLocation(loc)
    if type(loc) ~= 'table' or not loc.id or not loc.coords then return false end
    runtimeLocs[loc.id] = loc
    if mapActive then PM.SendMapData() end
    return true
end

local function removeLocation(id)
    runtimeLocs[id] = nil
    if mapActive then PM.SendMapData() end
end

exports('addMapLocation', addLocation)
exports('removeMapLocation', removeLocation)
RegisterNetEvent('cl-map:client:addLocation', addLocation)
RegisterNetEvent('cl-map:client:removeLocation', removeLocation)
RegisterNetEvent('cl-pausemenu:client:addLocation', addLocation)
RegisterNetEvent('cl-pausemenu:client:removeLocation', removeLocation)
