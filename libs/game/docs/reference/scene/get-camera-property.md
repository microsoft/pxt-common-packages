# Get Camera Property

Returns a property of the camera: `left`, `right`, `top` or `bottom`.

```sig
scene.getCameraProperty(CameraProperty.left)
```

## Example

```blocks
let top = scene.getCameraProperty(CameraProperty.top)
```

## Properties

### left

Returns the x-axis screen coordinate of the camera's left edge.

### right

Returns the x-axis screen coordinate of the camera's right edge.

### top

Returns the y-axis screen coordinate of the camera's top edge.

### bottom

Returns the y-axis screen coordinate of the camera's bottom edge.

## See also #seealso

[camera follow sprite](/reference/scene/camera-follow-sprite)
[center camera at](/reference/scene/center-camera-at)
