/**
 * Typed key/value data stored on Box2D bodies.
 */
//% color="#426b9a" weight=76 icon="\uf1c0" block="Box2D Data"
//% groups='["String", "Number", "Boolean", "Location", "Image", "Sprite", "Body", "Sprite Bodies", "Body Functions"]'
namespace bodyData {
    function getCore(target: box2dblocks.Body, key: string, type: string): any {
        const data = resolveTarget(target);
        const result = data["_" + type + "_" + key];
        if (!result && type == "number")
            return 0;
        return result;
    }

    function setCore(target: box2dblocks.Body, key: string, value: any, type: string): void {
        resolveTarget(target)["_" + type + "_" + key] = value;
    }

    function resolveTarget(target: box2dblocks.Body): any {
        if (target instanceof box2dblocks.Body)
            return target.data;
        throw "Unsupported body data target " + target;
    }

    function spriteData(target: Sprite): any {
        if (target instanceof Sprite)
            return target.data;
        throw "Unsupported sprite data target " + target;
    }

    //% blockId=box2d_body_data_set_string
    //% block="set $target data $key to string $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_string value.shadow=text
    //% weight=100 group="String" blockGap=8
    export function setString(target: box2dblocks.Body, key: string, value: string): void {
        setCore(target, key, value, "string");
    }

    //% blockId=box2d_body_data_get_string
    //% block="$target data $key as string"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_string
    //% weight=90 group="String"
    export function getString(target: box2dblocks.Body, key: string): string {
        return getCore(target, key, "string");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_string block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_string
    //% weight=80 group="String" blockHidden=true
    export function _keyString(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_string_array
    //% block="set $target data $key to string array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_string_array
    //% value.shadow=lists_create_with value.defl=text
    //% weight=50 group="String" blockGap=8
    export function setStringArray(target: box2dblocks.Body, key: string, value: string[]): void {
        setCore(target, key, value, "stringArray");
    }

    //% blockId=box2d_body_data_get_string_array
    //% block="$target data $key as string array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_string_array
    //% weight=40 group="String"
    export function getStringArray(target: box2dblocks.Body, key: string): string[] {
        return getCore(target, key, "stringArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_string_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_string_array
    //% weight=30 group="String" blockHidden=true
    export function _keyStringArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_number
    //% block="set $target data $key to number $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_number value.shadow=math_number
    //% weight=100 group="Number" blockGap=8
    export function setNumber(target: box2dblocks.Body, key: string, value: number): void {
        setCore(target, key, value, "number");
    }

    //% blockId=box2d_body_data_change_number
    //% block="change $target data $key by number $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_number
    //% weight=95 group="Number" blockGap=8
    export function changeNumber(target: box2dblocks.Body, key: string, value: number): void {
        setCore(target, key, getCore(target, key, "number") + value, "number");
    }

    //% blockId=box2d_body_data_get_number
    //% block="$target data $key as number"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_number
    //% weight=90 group="Number"
    export function getNumber(target: box2dblocks.Body, key: string): number {
        return getCore(target, key, "number");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_number block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_number
    //% weight=80 group="Number" blockHidden=true
    export function _keyNumber(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_number_array
    //% block="set $target data $key to number array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_number_array
    //% value.shadow=lists_create_with value.defl=math_number
    //% weight=50 group="Number" blockGap=8
    export function setNumberArray(target: box2dblocks.Body, key: string, value: number[]): void {
        setCore(target, key, value, "numberArray");
    }

    //% blockId=box2d_body_data_get_number_array
    //% block="$target data $key as number array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_number_array
    //% weight=40 group="Number"
    export function getNumberArray(target: box2dblocks.Body, key: string): number[] {
        return getCore(target, key, "numberArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_number_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_number_array
    //% weight=30 group="Number" blockHidden=true
    export function _keyNumberArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_boolean
    //% block="set $target data $key to boolean $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_boolean value.shadow=logic_boolean
    //% weight=100 group="Boolean" blockGap=8
    export function setBoolean(target: box2dblocks.Body, key: string, value: boolean): void {
        setCore(target, key, value, "boolean");
    }

    //% blockId=box2d_body_data_get_boolean
    //% block="$target data $key as boolean"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_boolean
    //% weight=90 group="Boolean"
    export function getBoolean(target: box2dblocks.Body, key: string): boolean {
        return getCore(target, key, "boolean");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_boolean block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_boolean
    //% weight=80 group="Boolean" blockHidden=true
    export function _keyBoolean(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_boolean_array
    //% block="set $target data $key to boolean array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_boolean_array
    //% value.shadow=lists_create_with value.defl=logic_boolean
    //% weight=50 group="Boolean" blockGap=8
    export function setBooleanArray(target: box2dblocks.Body, key: string, value: boolean[]): void {
        setCore(target, key, value, "booleanArray");
    }

    //% blockId=box2d_body_data_get_boolean_array
    //% block="$target data $key as boolean array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_boolean_array
    //% weight=40 group="Boolean"
    export function getBooleanArray(target: box2dblocks.Body, key: string): boolean[] {
        return getCore(target, key, "booleanArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_boolean_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_boolean_array
    //% weight=30 group="Boolean" blockHidden=true
    export function _keyBooleanArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_location
    //% block="set $target data $key to location $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_location value.shadow=mapgettile
    //% weight=100 group="Location" blockGap=8
    export function setLocation(target: box2dblocks.Body, key: string, value: tiles.Location): void {
        setCore(target, key, value, "tiles.Location");
    }

    //% blockId=box2d_body_data_get_location
    //% block="$target data $key as location"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_location
    //% weight=90 group="Location"
    export function getLocation(target: box2dblocks.Body, key: string): tiles.Location {
        return getCore(target, key, "tiles.Location");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_location block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_location
    //% weight=80 group="Location" blockHidden=true
    export function _keyLocation(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_location_array
    //% block="set $target data $key to location array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_location_array
    //% value.shadow=lists_create_with value.defl=mapgettile
    //% weight=50 group="Location" blockGap=8
    export function setLocationArray(target: box2dblocks.Body, key: string, value: tiles.Location[]): void {
        setCore(target, key, value, "tiles.LocationArray");
    }

    //% blockId=box2d_body_data_get_location_array
    //% block="$target data $key as location array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_location_array
    //% weight=40 group="Location"
    export function getLocationArray(target: box2dblocks.Body, key: string): tiles.Location[] {
        return getCore(target, key, "tiles.LocationArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_location_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_location_array
    //% weight=30 group="Location" blockHidden=true
    export function _keyLocationArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_image
    //% block="set $target data $key to image $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_image value.shadow=screen_image_picker
    //% weight=100 group="Image" blockGap=8
    export function setImage(target: box2dblocks.Body, key: string, value: Image): void {
        setCore(target, key, value, "Image");
    }

    //% blockId=box2d_body_data_get_image
    //% block="$target data $key as image"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_image
    //% weight=90 group="Image"
    export function getImage(target: box2dblocks.Body, key: string): Image {
        return getCore(target, key, "Image");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_image block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_image
    //% weight=80 group="Image" blockHidden=true
    export function _keyImage(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_image_array
    //% block="set $target data $key to image array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_image_array
    //% value.shadow=lists_create_with value.defl=screen_image_picker
    //% weight=50 group="Image" blockGap=8
    export function setImageArray(target: box2dblocks.Body, key: string, value: Image[]): void {
        setCore(target, key, value, "ImageArray");
    }

    //% blockId=box2d_body_data_get_image_array
    //% block="$target data $key as image array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_image_array
    //% weight=40 group="Image"
    export function getImageArray(target: box2dblocks.Body, key: string): Image[] {
        return getCore(target, key, "ImageArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_image_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_image_array
    //% weight=30 group="Image" blockHidden=true
    export function _keyImageArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_sprite
    //% block="set $target data $key to sprite $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_sprite
    //% value.shadow=variables_get value.defl=mySprite
    //% weight=100 group="Sprite" blockGap=8
    export function setSprite(target: box2dblocks.Body, key: string, value: Sprite): void {
        setCore(target, key, value, "Sprite");
    }

    //% blockId=box2d_body_data_get_sprite
    //% block="$target data $key as sprite"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_sprite
    //% weight=90 group="Sprite"
    export function getSprite(target: box2dblocks.Body, key: string): Sprite {
        return getCore(target, key, "Sprite");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_sprite block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_sprite
    //% weight=80 group="Sprite" blockHidden=true
    export function _keySprite(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_sprite_array
    //% block="set $target data $key to sprite array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_sprite_array
    //% value.shadow=lists_create_with value.defl=variables_get
    //% weight=50 group="Sprite" blockGap=8
    export function setSpriteArray(target: box2dblocks.Body, key: string, value: Sprite[]): void {
        setCore(target, key, value, "SpriteArray");
    }

    //% blockId=box2d_body_data_get_sprite_array
    //% block="$target data $key as sprite array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_sprite_array
    //% weight=40 group="Sprite"
    export function getSpriteArray(target: box2dblocks.Body, key: string): Sprite[] {
        return getCore(target, key, "SpriteArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_sprite_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_sprite_array
    //% weight=30 group="Sprite" blockHidden=true
    export function _keySpriteArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_body
    //% block="set $target data $key to body $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_body
    //% value.shadow=variables_get value.defl=myBody
    //% weight=100 group="Body" blockGap=8
    export function setBody(target: box2dblocks.Body, key: string, value: box2dblocks.Body): void {
        setCore(target, key, value, "Body");
    }

    //% blockId=box2d_body_data_get_body
    //% block="$target data $key as body"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_body
    //% weight=90 group="Body"
    export function getBody(target: box2dblocks.Body, key: string): box2dblocks.Body {
        return getCore(target, key, "Body");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_body block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_body
    //% weight=80 group="Body" blockHidden=true
    export function _keyBody(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_body_array
    //% block="set $target data $key to body array $value"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_body_array
    //% value.shadow=lists_create_with value.defl=variables_get
    //% weight=50 group="Body" blockGap=8
    export function setBodyArray(target: box2dblocks.Body, key: string, value: box2dblocks.Body[]): void {
        setCore(target, key, value, "BodyArray");
    }

    //% blockId=box2d_body_data_get_body_array
    //% block="$target data $key as body array"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_key_body_array
    //% weight=40 group="Body"
    export function getBodyArray(target: box2dblocks.Body, key: string): box2dblocks.Body[] {
        return getCore(target, key, "BodyArray");
    }

    //% shim=TD_ID blockId=box2d_body_data_key_body_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_body_array
    //% weight=30 group="Body" blockHidden=true
    export function _keyBodyArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_sprite_body
    //% block="set $target body data $key to $value"
    //% target.shadow=variables_get target.defl=mySprite
    //% key.shadow=box2d_body_data_key_sprite_body
    //% value.shadow=variables_get value.defl=myBody
    //% weight=100 group="Sprite Bodies" blockGap=8
    export function setSpriteBody(target: Sprite, key: string, value: box2dblocks.Body): void {
        spriteData(target)["_Body_" + key] = value;
    }

    //% blockId=box2d_body_data_get_sprite_body
    //% block="$target body data $key"
    //% target.shadow=variables_get target.defl=mySprite
    //% key.shadow=box2d_body_data_key_sprite_body
    //% weight=90 group="Sprite Bodies"
    export function getSpriteBody(target: Sprite, key: string): box2dblocks.Body {
        return spriteData(target)["_Body_" + key];
    }

    //% shim=TD_ID blockId=box2d_body_data_key_sprite_body block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_sprite_body
    //% weight=80 group="Sprite Bodies" blockHidden=true
    export function _keySpriteBody(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_sprite_body_array
    //% block="set $target body array data $key to $value"
    //% target.shadow=variables_get target.defl=mySprite
    //% key.shadow=box2d_body_data_key_sprite_body_array
    //% value.shadow=lists_create_with value.defl=variables_get
    //% weight=50 group="Sprite Bodies" blockGap=8
    export function setSpriteBodyArray(target: Sprite, key: string, value: box2dblocks.Body[]): void {
        spriteData(target)["_BodyArray_" + key] = value;
    }

    //% blockId=box2d_body_data_get_sprite_body_array
    //% block="$target body array data $key"
    //% target.shadow=variables_get target.defl=mySprite
    //% key.shadow=box2d_body_data_key_sprite_body_array
    //% weight=40 group="Sprite Bodies"
    export function getSpriteBodyArray(target: Sprite, key: string): box2dblocks.Body[] {
        return spriteData(target)["_BodyArray_" + key];
    }

    //% shim=TD_ID blockId=box2d_body_data_key_sprite_body_array block="$key"
    //% key.fieldEditor=autocomplete key.fieldOptions.decompileLiterals=true
    //% key.fieldOptions.key=box2d_body_data_key_sprite_body_array
    //% weight=30 group="Sprite Bodies" blockHidden=true
    export function _keySpriteBodyArray(key: string): string {
        return key;
    }

    //% blockId=box2d_body_data_set_function
    //% block="$target define function $key with $body"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_function_key
    //% draggableParameters="reporter" handlerStatement=1
    //% group="Body Functions" weight=100 blockGap=8
    export function setFunction(target: box2dblocks.Body, key: string, value: (body: box2dblocks.Body) => void): void {
        setCore(target, key, value, "function");
    }

    //% blockId=box2d_body_data_call_function
    //% block="call $target function $key"
    //% target.shadow=variables_get target.defl=myBody
    //% key.shadow=box2d_body_data_function_key
    //% group="Body Functions" weight=90
    export function callFunction(target: box2dblocks.Body, key: string): void {
        const func = getCore(target, key, "function") as ((body: box2dblocks.Body) => void);
        if (func)
            func(target);
    }

    //% shim=TD_ID blockId=box2d_body_data_function_key block="$key"
    //% group="Body Functions" blockHidden=true
    export function _functionKey(key: string): string {
        return key;
    }
}
