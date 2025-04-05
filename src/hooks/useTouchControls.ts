import { useEffect, useRef } from "react";
import nipplejs, {
  JoystickManager,
  JoystickOutputData,
  EventData,
} from "nipplejs";
import { useBoatStore } from "../store/boatStore";

export const useTouchControls = () => {
  const { setKey } = useBoatStore();
  const joystickRef = useRef<JoystickManager | null>(null);

  useEffect(() => {
    // Only create joystick on touch devices
    if (!("ontouchstart" in window)) return;

    // Create joystick container if it doesn't exist
    let joystickContainer = document.getElementById("joystick-container");
    if (!joystickContainer) {
      joystickContainer = document.createElement("div");
      joystickContainer.id = "joystick-container";
      joystickContainer.style.position = "fixed";
      joystickContainer.style.bottom = "100px";
      joystickContainer.style.right = "100px";
      joystickContainer.style.width = "120px";
      joystickContainer.style.height = "120px";
      joystickContainer.style.zIndex = "9999";
      document.body.appendChild(joystickContainer);
    }

    // Create nipple joystick
    const options = {
      zone: joystickContainer,
      mode: "static" as const,
      position: { left: "50%", top: "50%" },
      color: "white",
      size: 120,
      lockX: false,
      lockY: false,
    };

    const joystick = nipplejs.create(options);
    joystickRef.current = joystick;

    // Reset all keys on joystick creation
    setKey("w", false);
    setKey("a", false);
    setKey("s", false);
    setKey("d", false);

    // Handle joystick move
    joystick.on("move", (evt: EventData, data: JoystickOutputData) => {
      const angle = data.angle.radian;
      const force = Math.min(data.force, 1.0);

      // Only register keys when the force is significant
      if (force > 0.3) {
        // Reset all keys
        setKey("w", false);
        setKey("a", false);
        setKey("s", false);
        setKey("d", false);

        // Forward/backward controls
        if (angle > Math.PI * 0.75 && angle < Math.PI * 1.25) {
          // Left
          setKey("a", true);
        } else if (angle > Math.PI * 1.75 || angle < Math.PI * 0.25) {
          // Right
          setKey("d", true);
        }

        // Left/right controls
        if (angle > Math.PI * 0.25 && angle < Math.PI * 0.75) {
          // Down
          setKey("s", true);
        } else if (angle > Math.PI * 1.25 && angle < Math.PI * 1.75) {
          // Up
          setKey("w", true);
        }
      }
    });

    // Handle joystick end
    joystick.on("end", () => {
      // Reset all keys when joystick is released
      setKey("w", false);
      setKey("a", false);
      setKey("s", false);
      setKey("d", false);
    });

    return () => {
      // Cleanup
      if (joystickRef.current) {
        joystickRef.current.destroy();
        joystickRef.current = null;
      }

      if (joystickContainer) {
        document.body.removeChild(joystickContainer);
      }
    };
  }, [setKey]);
};
