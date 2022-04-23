import { useEffect } from 'react';
import WebMidi, { Input } from 'webmidi';

const connected = [];
const cc = {};
let activeOut = 0;

function getDeviceById(id: number) {
  const index = connected.findIndex((d) => d.id === id);
  return connected[index];
}

function removeDevice(id: number) {
  const index = connected.findIndex((d) => d.id === id);
  connected.splice(index, 1);
}

function addMidiListerner(inputDevice: Input) {
  const device = WebMidi.getInputById(inputDevice.id);
  connected.push(device);

  device.addListener('controlchange', 'all', (e) => {
    const mId = e.controller.number;
    cc[mId] = e.value / 127;
    console.log(mId, cc[mId], `(raw ${e.value})`);
  });

  device.addListener('controlchange', 'all', (e) => {
    const mId = e.controller.number;

    if (mId === 43 && e.value === 127) {
      activeOut -= 1;
      if (activeOut < 0) {
        activeOut = 3;
      }
      window.render(window[`o${activeOut}`]);
    }

    if (mId === 44 && e.value === 127) {
      activeOut += 1;
      if (activeOut > 3) {
        activeOut = 0;
      }
      window.render(window[`o${activeOut}`]);
    }
  });
}

export function useGlobalWebMidi() {
  useEffect(() => {
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
            device = connectedDevice.port;
          }
          if (device.type === 'input') {
            addMidiListerner(device);
          }
        });

        WebMidi.addListener('disconnected', (disconnected) => {
          let device = getDeviceById(disconnected.id);
          if (disconnected.port) {
            device = getDeviceById(disconnected.port.id);
          }
          if (device) {
            device.removeListener('noteon');
            device.removeListener('noteoff');
            removeDevice(disconnected.id);
          }
        });
      }, 100);
    });

    return () => {
      delete window.cc;
      WebMidi.disable();
    };
  }, []);
}
