import { useEffect } from 'react';
import WebMidi, { Input } from 'webmidi';

// @ts-ignore
const connected = [];
const cc = {};
let activeOut = 0;

function getDeviceById(id: number) {
  // @ts-ignore
  const index = connected.findIndex((d) => d.id === id);
  // @ts-ignore
  return connected[index];
}

function removeDevice(id: number) {
  // @ts-ignore
  const index = connected.findIndex((d) => d.id === id);
  // @ts-ignore
  connected.splice(index, 1);
}

function addMidiListerner(inputDevice: Input) {
  const device = WebMidi.getInputById(inputDevice.id);
  connected.push(device);

  // @ts-ignore
  device.addListener('controlchange', 'all', (e) => {
    const mId = e.controller.number;
    // @ts-ignore
    cc[mId] = e.value / 127;
    // @ts-ignore
    console.log(mId, cc[mId], `(raw ${e.value})`);
  });

  // @ts-ignore
  device.addListener('controlchange', 'all', (e) => {
    const mId = e.controller.number;

    if (mId === 43 && e.value === 127) {
      activeOut -= 1;
      if (activeOut < 0) {
        activeOut = 3;
      }
      // @ts-ignore
      window.render(window[`o${activeOut}`]);
    }

    if (mId === 44 && e.value === 127) {
      activeOut += 1;
      if (activeOut > 3) {
        activeOut = 0;
      }
      // @ts-ignore
      window.render(window[`o${activeOut}`]);
    }
  });
}

export function useGlobalWebMidi() {
  useEffect(() => {
    // @ts-ignore
    window.cc = cc;
    for (let i = 0; i < 999; i += 1) {
      // @ts-ignore
      window.cc[i] = 0;
    }

    WebMidi.enable((err) => {
      if (err) {
        throw err;
      }

      setTimeout(() => {
        if (WebMidi.inputs) {
          WebMidi.inputs.forEach((input) => {
            addMidiListerner(input);
          });
        }
        WebMidi.addListener('connected', (connectedDevice) => {
          let device = connectedDevice;
          if (connectedDevice.port) {
            // @ts-ignore
            device = connectedDevice.port;
          }
          // @ts-ignore
          if (device.type === 'input') {
            // @ts-ignore
            addMidiListerner(device);
          }
        });

        WebMidi.addListener('disconnected', (disconnected) => {
          // @ts-ignore
          let device = getDeviceById(disconnected.id);
          if (disconnected.port) {
            // @ts-ignore
            device = getDeviceById(disconnected.port.id);
          }
          if (device) {
            device.removeListener('noteon');
            device.removeListener('noteoff');
            // @ts-ignore
            removeDevice(disconnected.id);
          }
        });
      }, 100);
    });

    return () => {
      // @ts-ignore
      delete window.cc;
      WebMidi.disable();
    };
  }, []);
}
