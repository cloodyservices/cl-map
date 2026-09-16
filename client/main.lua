local opened = false
local textFocused = false
local keyboard = true
local generation = 0
local previousHud = false
local previousRadar = false

local buttons = {
    { 188, 'up', true }, { 187, 'down', true }, { 189, 'left', true }, { 190, 'right', true },
    { 201, 'accept' }, { 202, 'cancel' }, { 203, 'x' }, { 204, 'y' },
    { 205, 'lb' }, { 206, 'rb' }, { 207, 'lt' }, { 208, 'rt' },
}

local function keepInput()
    SetNuiFocusKeepInput(opened and Config.GamepadSupport and not keyboard and not textFocused)
end

local function setOtherUisState(show)
    pcall(function()
        LocalPlayer.state:set('inv_busy', not show, false)
        LocalPlayer.state:set('pauseMenu', not show, false)
        LocalPlayer.state:set('hud_hidden', not show, false)

        TriggerEvent('qb-hud:client:hudState', show)
        TriggerEvent('qb-hud:client:ToggleHud', show)
        TriggerEvent('qb-hud:client:toggleCompass', show)
        TriggerEvent('qb-hud:client:toggleRadar', show)
        TriggerEvent('hud:client:ToggleHud', show)
        TriggerEvent('hud:client:hudState', show)
        TriggerEvent('hud:client:toggleCompass', show)
        TriggerEvent('hud:client:toggleRadar', show)

        if show then
            TriggerEvent('qbx_hud:client:showHud')
            TriggerEvent('qbx_hud:client:showCompass', true)
            TriggerEvent('qbx_hud:client:toggleCompass', true)
        else
            TriggerEvent('qbx_hud:client:hideHud')
            TriggerEvent('qbx_hud:client:showCompass', false)
            TriggerEvent('qbx_hud:client:toggleCompass', false)
        end
        TriggerEvent('qbx_hud:client:hudState', show)

        TriggerEvent('ps-hud:client:toggleCompass', show)
        TriggerEvent('ps-hud:client:toggleRadar', show)
        TriggerEvent('ps-hud:client:hudState', show)

        TriggerEvent('pma-voice:client:hideVoice', not show)

        if GetResourceState('qb-hud') == 'started' then
            pcall(function() exports['qb-hud']:toggleCompass(show) end)
            pcall(function()
                if show then exports['qb-hud']:showHud() else exports['qb-hud']:hideHud() end
            end)
        end
        if GetResourceState('qbx_hud') == 'started' then
            pcall(function() exports['qbx_hud']:toggleCompass(show) end)
            pcall(function()
                if show then exports['qbx_hud']:showHud() else exports['qbx_hud']:hideHud() end
            end)
        end
        if GetResourceState('ps-hud') == 'started' then
            pcall(function() exports['ps-hud']:toggleCompass(show) end)
            pcall(function()
                if show then exports['ps-hud']:showHud() else exports['ps-hud']:hideHud() end
            end)
        end
    end)
end

local function close()
    if not opened then return end
    opened = false
    generation = generation + 1

    PM.MapClosed()
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    if Config.Blur then
        TriggerScreenblurFadeOut(150)
    end
    ClearTimecycleModifier()

    setOtherUisState(true)
    DisplayHud(not previousHud)
    DisplayRadar(not previousRadar)

    SendNUIMessage({ action = 'close' })
end

local function open()
    if opened or IsPauseMenuActive() then return end

    if GetResourceState('cl-pausemenu') == 'started' then
        pcall(function() exports['cl-pausemenu']:close() end)
    end

    opened = true
    textFocused = false
    generation = generation + 1
    local session = generation

    previousHud = IsHudHidden()
    previousRadar = IsRadarHidden()
    keyboard = IsInputDisabled(2)

    SetNuiFocus(true, true)
    keepInput()
    setOtherUisState(false)
    ClearTimecycleModifier()

    if Config.Blur then
        TriggerScreenblurFadeIn(150)
    end

    SendNUIMessage({
        action = 'open',
        screen = 'map',
        data = {
            appearance = Config.Appearance,
            map = PM.GetMapConfig(),
            strings = Config.Strings,
            debug = Config.Debug,
            device = keyboard and 'keyboard' or 'gamepad',
            values = {
                map_theme = Config.Theme,
                map_style = Config.Style,
                map_zoom = Config.Zoom,
                menu_sounds = Config.Sounds,
                menu_scanlines = Config.Scanlines ~= false,
                menu_hints = Config.Hints ~= false,
            },
        }
    })

    PM.MapOpened()

    CreateThread(function()
        local held = {}
        local hudTick = 0

        while opened and generation == session do
            Wait(0)
            if not opened or generation ~= session then break end

            DisableAllControlActions(0)
            DisableAllControlActions(1)
            DisableControlAction(0, 199, true)
            DisableControlAction(0, 200, true)
            HideHudAndRadarThisFrame()
            DisplayRadar(false)
            DisplayHud(false)

            for i = 1, 22 do
                HideHudComponentThisFrame(i)
            end

            hudTick = hudTick + 1
            if hudTick >= 30 then
                hudTick = 0
                setOtherUisState(false)
            end

            local kb = IsInputDisabled(2)
            if keyboard ~= kb then
                keyboard = kb
                SendNUIMessage({ action = 'device', device = kb and 'keyboard' or 'gamepad' })
                keepInput()
            end

            if Config.GamepadSupport and not keyboard and not textFocused then
                local now = GetGameTimer()
                for _, b in ipairs(buttons) do
                    local control, action, repeats = b[1], b[2], b[3]
                    if IsDisabledControlJustPressed(2, control) then
                        SendNUIMessage({ action = 'input', key = action })
                        held[control] = now + 380
                    elseif repeats and held[control] and IsDisabledControlPressed(2, control) then
                        if now >= held[control] then
                            SendNUIMessage({ action = 'input', key = action })
                            held[control] = now + 110
                        end
                    else
                        held[control] = nil
                    end
                end

                local ax = GetDisabledControlNormal(2, 195)
                local ay = GetDisabledControlNormal(2, 196)
                if math.abs(ax) > 0.18 or math.abs(ay) > 0.18 then
                    SendNUIMessage({ action = 'pan', x = ax, y = ay })
                end
            end
        end
    end)
end

local function toggle()
    if opened then close() else open() end
end

RegisterCommand(Config.Command, toggle, false)
RegisterKeyMapping(Config.Command, 'Open city map', 'keyboard', Config.OpenKey)

RegisterNUICallback('close', function(_, cb)
    close()
    cb(1)
end)

RegisterNUICallback('inputFocus', function(data, cb)
    textFocused = data and data.focused == true
    keepInput()
    cb(1)
end)

RegisterNUICallback('sound', function(data, cb)
    if opened and Config.Sounds and type(data.name) == 'string' then
        PlaySoundFrontend(-1, data.name, 'HUD_FRONTEND_DEFAULT_SOUNDSET', true)
    end
    cb(1)
end)

exports('open', open)
exports('close', close)
exports('toggle', toggle)
exports('isOpen', function() return opened end)

RegisterNetEvent('cl-map:client:open', open)
RegisterNetEvent('cl-map:client:close', close)
RegisterNetEvent('cl-map:client:toggle', toggle)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        close()
    end
end)
