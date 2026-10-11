(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,ee=1029,O=1030,k=1031,te=1033,A=33776,ne=33777,j=33778,re=33779,M=35840,ie=35841,ae=35842,oe=35843,se=36196,ce=37492,le=37496,ue=37488,N=37489,de=37490,fe=37491,pe=37808,me=37809,he=37810,ge=37811,_e=37812,ve=37813,ye=37814,be=37815,xe=37816,Se=37817,Ce=37818,we=37819,Te=37820,Ee=37821,De=36492,Oe=36494,ke=36495,Ae=36283,je=36284,Me=36285,Ne=36286,Pe=2300,P=2301,Fe=2302,Ie=2303,Le=2400,F=2401,Re=2402,I=3200,ze=`srgb`,Be=`srgb-linear`,Ve=`linear`,He=`srgb`,Ue=7680,We=35044,Ge=2e3;function Ke(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function qe(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Je(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ye(){let e=Je(`canvas`);return e.style.display=`block`,e}var Xe={};function Ze(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Qe(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=Qe(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=Qe(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function $e(...e){let t=e.join(` `);t in Xe||(Xe[t]=!0,L(...e))}function et(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var tt={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},nt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},rt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),it=Math.PI/180,at=180/Math.PI;function ot(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(rt[e&255]+rt[e>>8&255]+rt[e>>16&255]+rt[e>>24&255]+`-`+rt[t&255]+rt[t>>8&255]+`-`+rt[t>>16&15|64]+rt[t>>24&255]+`-`+rt[n&63|128]+rt[n>>8&255]+`-`+rt[n>>16&255]+rt[n>>24&255]+rt[r&255]+rt[r>>8&255]+rt[r>>16&255]+rt[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function st(e,t){return(e%t+t)%t}function ct(e,t,n){return(1-n)*e+n*t}function lt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function ut(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var B=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},dt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(pt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(pt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ft.copy(this).projectOnVector(e),this.sub(ft)}reflect(e){return this.sub(ft.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ft=new V,pt=new dt,H=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return $e(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(mt.makeScale(e,t)),this}rotate(e){return $e(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(mt.makeRotation(-e)),this}translate(e,t){return $e(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(mt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},mt=new H,ht=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),gt=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function _t(){let e={enabled:!0,workingColorSpace:Be,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=yt(e.r),e.g=yt(e.g),e.b=yt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=bt(e.r),e.g=bt(e.g),e.b=bt(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Ve:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return $e(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return $e(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Be]:{primaries:t,whitePoint:r,transfer:Ve,toXYZ:ht,fromXYZ:gt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ze},outputColorSpaceConfig:{drawingBufferColorSpace:ze}},[ze]:{primaries:t,whitePoint:r,transfer:He,toXYZ:ht,fromXYZ:gt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ze}}}),e}var vt=_t();function yt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function bt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var xt,St=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{xt===void 0&&(xt=Je(`canvas`)),xt.width=e.width,xt.height=e.height;let t=xt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=xt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Je(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=yt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(yt(t[e]/255)*255):t[e]=yt(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Ct=0,wt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ct++}),this.uuid=ot(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Tt(r[t].image)):e.push(Tt(r[t]))}else e=Tt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Tt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?St.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var Et=0,Dt=new V,Ot=class r extends nt{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Et++}),this.uuid=ot(),this.name=``,this.source=new wt(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Dt).x}get height(){return this.source.getSize(Dt).y}get depth(){return this.source.getSize(Dt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ot.DEFAULT_IMAGE=null,Ot.DEFAULT_MAPPING=300,Ot.DEFAULT_ANISOTROPY=1;var kt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},At=class extends nt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new kt(0,0,e,t),this.scissorTest=!1,this.viewport=new kt(0,0,e,t),this.textures=[];let r=new Ot({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new wt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},jt=class extends At{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Mt=class extends Ot{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Nt=class extends Ot{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Pt=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Ft.setFromMatrixColumn(e,0).length(),i=1/Ft.setFromMatrixColumn(e,1).length(),a=1/Ft.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Lt,e,Rt)}lookAt(e,t,n){let r=this.elements;return Vt.subVectors(e,t),Vt.lengthSq()===0&&(Vt.z=1),Vt.normalize(),zt.crossVectors(n,Vt),zt.lengthSq()===0&&(Math.abs(n.z)===1?Vt.x+=1e-4:Vt.z+=1e-4,Vt.normalize(),zt.crossVectors(n,Vt)),zt.normalize(),Bt.crossVectors(Vt,zt),r[0]=zt.x,r[4]=Bt.x,r[8]=Vt.x,r[1]=zt.y,r[5]=Bt.y,r[9]=Vt.y,r[2]=zt.z,r[6]=Bt.z,r[10]=Vt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],ee=r[13],O=r[2],k=r[6],te=r[10],A=r[14],ne=r[3],j=r[7],re=r[11],M=r[15];return i[0]=a*x+o*T+s*O+c*ne,i[4]=a*S+o*E+s*k+c*j,i[8]=a*C+o*D+s*te+c*re,i[12]=a*w+o*ee+s*A+c*M,i[1]=l*x+u*T+d*O+f*ne,i[5]=l*S+u*E+d*k+f*j,i[9]=l*C+u*D+d*te+f*re,i[13]=l*w+u*ee+d*A+f*M,i[2]=p*x+m*T+h*O+g*ne,i[6]=p*S+m*E+h*k+g*j,i[10]=p*C+m*D+h*te+g*re,i[14]=p*w+m*ee+h*A+g*M,i[3]=_*x+v*T+y*O+b*ne,i[7]=_*S+v*E+y*k+b*j,i[11]=_*C+v*D+y*te+b*re,i[15]=_*w+v*ee+y*A+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,ee=d*g-f*h,O=_*ee-v*D+y*E+b*T-x*w+S*C;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/O;return e[0]=(o*ee-s*D+c*E)*k,e[1]=(r*D-n*ee-i*E)*k,e[2]=(m*S-h*x+g*b)*k,e[3]=(d*x-u*S-f*b)*k,e[4]=(s*T-a*ee-c*w)*k,e[5]=(t*ee-r*T+i*w)*k,e[6]=(h*y-p*S-g*v)*k,e[7]=(l*S-d*y+f*v)*k,e[8]=(a*D-o*T+c*C)*k,e[9]=(n*T-t*D-i*C)*k,e[10]=(p*x-m*y+g*_)*k,e[11]=(u*y-l*x-f*_)*k,e[12]=(o*w-a*E-s*C)*k,e[13]=(t*E-n*w+r*C)*k,e[14]=(m*v-p*b-h*_)*k,e[15]=(l*b-u*v+d*_)*k,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Ft.set(r[0],r[1],r[2]).length(),o=Ft.set(r[4],r[5],r[6]).length(),s=Ft.set(r[8],r[9],r[10]).length();i<0&&(a=-a),It.copy(this);let c=1/a,l=1/o,u=1/s;return It.elements[0]*=c,It.elements[1]*=c,It.elements[2]*=c,It.elements[4]*=l,It.elements[5]*=l,It.elements[6]*=l,It.elements[8]*=u,It.elements[9]*=u,It.elements[10]*=u,t.setFromRotationMatrix(It),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Ge,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ge,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ft=new V,It=new Pt,Lt=new V(0,0,0),Rt=new V(1,1,1),zt=new V,Bt=new V,Vt=new V,Ht=new Pt,Ut=new dt,Wt=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ht.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ht,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ut.setFromEuler(this),this.setFromQuaternion(Ut,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wt.DEFAULT_ORDER=`XYZ`;var Gt=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Kt=0,qt=new V,Jt=new dt,Yt=new Pt,Xt=new V,Zt=new V,Qt=new V,$t=new dt,en=new V(1,0,0),tn=new V(0,1,0),nn=new V(0,0,1),rn={type:`added`},an={type:`removed`},on={type:`childadded`,child:null},sn={type:`childremoved`,child:null},cn=class e extends nt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Kt++}),this.uuid=ot(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new Wt,r=new dt,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Pt},normalMatrix:{value:new H}}),this.matrix=new Pt,this.matrixWorld=new Pt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Gt,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Jt.setFromAxisAngle(e,t),this.quaternion.multiply(Jt),this}rotateOnWorldAxis(e,t){return Jt.setFromAxisAngle(e,t),this.quaternion.premultiply(Jt),this}rotateX(e){return this.rotateOnAxis(en,e)}rotateY(e){return this.rotateOnAxis(tn,e)}rotateZ(e){return this.rotateOnAxis(nn,e)}translateOnAxis(e,t){return qt.copy(e).applyQuaternion(this.quaternion),this.position.add(qt.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(en,e)}translateY(e){return this.translateOnAxis(tn,e)}translateZ(e){return this.translateOnAxis(nn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Yt.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Xt.copy(e):Xt.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Zt.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Yt.lookAt(Zt,Xt,this.up):Yt.lookAt(Xt,Zt,this.up),this.quaternion.setFromRotationMatrix(Yt),r&&(Yt.extractRotation(r.matrixWorld),Jt.setFromRotationMatrix(Yt),this.quaternion.premultiply(Jt.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(rn),on.child=e,this.dispatchEvent(on),on.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(an),sn.child=e,this.dispatchEvent(sn),sn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Yt.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Yt.multiply(e.parent.matrixWorld)),e.applyMatrix4(Yt),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(rn),on.child=e,this.dispatchEvent(on),on.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zt,e,Qt),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zt,$t,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};cn.DEFAULT_UP=new V(0,1,0),cn.DEFAULT_MATRIX_AUTO_UPDATE=!0,cn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var U=class extends cn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},ln={type:`move`},un=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new U,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new U,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new U,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ln)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new U;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},dn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fn={h:0,s:0,l:0},pn={h:0,s:0,l:0};function mn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var W=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ze){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,vt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=vt.workingColorSpace){return this.r=e,this.g=t,this.b=n,vt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=vt.workingColorSpace){if(e=st(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=mn(i,r,e+1/3),this.g=mn(i,r,e),this.b=mn(i,r,e-1/3)}return vt.colorSpaceToWorking(this,r),this}setStyle(e,t=ze){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ze){let n=dn[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yt(e.r),this.g=yt(e.g),this.b=yt(e.b),this}copyLinearToSRGB(e){return this.r=bt(e.r),this.g=bt(e.g),this.b=bt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ze){return vt.workingToColorSpace(hn.copy(this),e),Math.round(z(hn.r*255,0,255))*65536+Math.round(z(hn.g*255,0,255))*256+Math.round(z(hn.b*255,0,255))}getHexString(e=ze){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=vt.workingColorSpace){vt.workingToColorSpace(hn.copy(this),t);let n=hn.r,r=hn.g,i=hn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=vt.workingColorSpace){return vt.workingToColorSpace(hn.copy(this),t),e.r=hn.r,e.g=hn.g,e.b=hn.b,e}getStyle(e=ze){vt.workingToColorSpace(hn.copy(this),e);let t=hn.r,n=hn.g,r=hn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(fn),this.setHSL(fn.h+e,fn.s+t,fn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(fn),e.getHSL(pn);let n=ct(fn.h,pn.h,t),r=ct(fn.s,pn.s,t),i=ct(fn.l,pn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},hn=new W;W.NAMES=dn;var gn=class extends cn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wt,this.environmentIntensity=1,this.environmentRotation=new Wt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},_n=new V,vn=new V,yn=new V,bn=new V,xn=new V,Sn=new V,Cn=new V,wn=new V,Tn=new V,En=new V,Dn=new kt,On=new kt,kn=new kt,An=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),_n.subVectors(e,t),r.cross(_n);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){_n.subVectors(r,t),vn.subVectors(n,t),yn.subVectors(e,t);let a=_n.dot(_n),o=_n.dot(vn),s=_n.dot(yn),c=vn.dot(vn),l=vn.dot(yn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,bn)!==null&&bn.x>=0&&bn.y>=0&&bn.x+bn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,bn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,bn.x),s.addScaledVector(a,bn.y),s.addScaledVector(o,bn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Dn.setScalar(0),On.setScalar(0),kn.setScalar(0),Dn.fromBufferAttribute(e,t),On.fromBufferAttribute(e,n),kn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Dn,i.x),a.addScaledVector(On,i.y),a.addScaledVector(kn,i.z),a}static isFrontFacing(e,t,n,r){return _n.subVectors(n,t),vn.subVectors(e,t),_n.cross(vn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _n.subVectors(this.c,this.b),vn.subVectors(this.a,this.b),_n.cross(vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;xn.subVectors(r,n),Sn.subVectors(i,n),wn.subVectors(e,n);let s=xn.dot(wn),c=Sn.dot(wn);if(s<=0&&c<=0)return t.copy(n);Tn.subVectors(e,r);let l=xn.dot(Tn),u=Sn.dot(Tn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(xn,a);En.subVectors(e,i);let f=xn.dot(En),p=Sn.dot(En);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Sn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Cn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Cn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(xn,a).addScaledVector(Sn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},jn=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Nn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Nn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Nn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Nn):Nn.fromBufferAttribute(r,t),Nn.applyMatrix4(e.matrixWorld),this.expandByPoint(Nn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Pn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Pn.copy(e.boundingBox)),Pn.applyMatrix4(e.matrixWorld),this.union(Pn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Nn),Nn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vn),Hn.subVectors(this.max,Vn),Fn.subVectors(e.a,Vn),In.subVectors(e.b,Vn),Ln.subVectors(e.c,Vn),Rn.subVectors(In,Fn),zn.subVectors(Ln,In),Bn.subVectors(Fn,Ln);let t=[0,-Rn.z,Rn.y,0,-zn.z,zn.y,0,-Bn.z,Bn.y,Rn.z,0,-Rn.x,zn.z,0,-zn.x,Bn.z,0,-Bn.x,-Rn.y,Rn.x,0,-zn.y,zn.x,0,-Bn.y,Bn.x,0];return!Gn(t,Fn,In,Ln,Hn)||(t=[1,0,0,0,1,0,0,0,1],!Gn(t,Fn,In,Ln,Hn))?!1:(Un.crossVectors(Rn,zn),t=[Un.x,Un.y,Un.z],Gn(t,Fn,In,Ln,Hn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Nn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Nn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Mn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Mn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Mn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Mn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Mn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Mn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Mn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Mn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Mn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Mn=[new V,new V,new V,new V,new V,new V,new V,new V],Nn=new V,Pn=new jn,Fn=new V,In=new V,Ln=new V,Rn=new V,zn=new V,Bn=new V,Vn=new V,Hn=new V,Un=new V,Wn=new V;function Gn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Wn.fromArray(e,a);let o=i.x*Math.abs(Wn.x)+i.y*Math.abs(Wn.y)+i.z*Math.abs(Wn.z),s=t.dot(Wn),c=n.dot(Wn),l=r.dot(Wn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Kn=new V,qn=new B,Jn=0,Yn=class extends nt{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Jn++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=We,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)qn.fromBufferAttribute(this,t),qn.applyMatrix3(e),this.setXY(t,qn.x,qn.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Kn.fromBufferAttribute(this,t),Kn.applyMatrix3(e),this.setXYZ(t,Kn.x,Kn.y,Kn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Kn.fromBufferAttribute(this,t),Kn.applyMatrix4(e),this.setXYZ(t,Kn.x,Kn.y,Kn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Kn.fromBufferAttribute(this,t),Kn.applyNormalMatrix(e),this.setXYZ(t,Kn.x,Kn.y,Kn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Kn.fromBufferAttribute(this,t),Kn.transformDirection(e),this.setXYZ(t,Kn.x,Kn.y,Kn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=lt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ut(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=lt(t,this.array)),t}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=lt(t,this.array)),t}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=lt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=lt(t,this.array)),t}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array),i=ut(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},Xn=class extends Yn{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Zn=class extends Yn{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Qn=class extends Yn{constructor(e,t,n){super(new Float32Array(e),t,n)}},$n=new jn,er=new V,tr=new V,nr=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?$n.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;er.subVectors(e,this.center);let t=er.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(er,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(tr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(er.copy(e.center).add(tr)),this.expandByPoint(er.copy(e.center).sub(tr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},rr=0,ir=new Pt,ar=new cn,or=new V,sr=new jn,cr=new jn,lr=new V,ur=class e extends nt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rr++}),this.uuid=ot(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Ke(e)?Zn:Xn)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ir.makeRotationFromQuaternion(e),this.applyMatrix4(ir),this}rotateX(e){return ir.makeRotationX(e),this.applyMatrix4(ir),this}rotateY(e){return ir.makeRotationY(e),this.applyMatrix4(ir),this}rotateZ(e){return ir.makeRotationZ(e),this.applyMatrix4(ir),this}translate(e,t,n){return ir.makeTranslation(e,t,n),this.applyMatrix4(ir),this}scale(e,t,n){return ir.makeScale(e,t,n),this.applyMatrix4(ir),this}lookAt(e){return ar.lookAt(e),ar.updateMatrix(),this.applyMatrix4(ar.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(or).negate(),this.translate(or.x,or.y,or.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Qn(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new jn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];sr.setFromBufferAttribute(n),this.morphTargetsRelative?(lr.addVectors(this.boundingBox.min,sr.min),this.boundingBox.expandByPoint(lr),lr.addVectors(this.boundingBox.max,sr.max),this.boundingBox.expandByPoint(lr)):(this.boundingBox.expandByPoint(sr.min),this.boundingBox.expandByPoint(sr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new nr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);else if(e){let n=this.boundingSphere.center;if(sr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];cr.setFromBufferAttribute(n),this.morphTargetsRelative?(lr.addVectors(sr.min,cr.min),sr.expandByPoint(lr),lr.addVectors(sr.max,cr.max),sr.expandByPoint(lr)):(sr.expandByPoint(cr.min),sr.expandByPoint(cr.max))}sr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)lr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(lr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)lr.fromBufferAttribute(a,t),o&&(or.fromBufferAttribute(e,t),lr.add(or)),r=Math.max(r,n.distanceToSquared(lr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Yn(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Yn(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)lr.fromBufferAttribute(e,t),lr.normalize(),e.setXYZ(t,lr.x,lr.y,lr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Yn(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},dr=new V,fr=new V,pr=new H,mr=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=dr.subVectors(n,t).cross(fr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(dr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||pr.getNormalMatrix(e),r=this.coplanarPoint(dr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},hr=0,gr=class extends nt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:hr++}),this.uuid=ot(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new W(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ue,this.stencilZFail=Ue,this.stencilZPass=Ue,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new W().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new mr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new B().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new B().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},_r=new V,vr=new V,yr=new V,br=new V,xr=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_r)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=_r.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_r.copy(this.origin).addScaledVector(this.direction,t),_r.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){vr.copy(e).add(t).multiplyScalar(.5),yr.copy(t).sub(e).normalize(),br.copy(this.origin).sub(vr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(yr),o=br.dot(this.direction),s=-br.dot(yr),c=br.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(vr).addScaledVector(yr,d),f}intersectSphere(e,t){if(e.radius<0)return null;_r.subVectors(e.center,this.origin);let n=_r.dot(this.direction),r=_r.dot(_r)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,_r)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,ee,O,k,te,A,ne;if(y>=b&&y>=x?(w=s,D=u,k=p,ne=g,s>=0?(S=c,C=l,T=d,E=f,ee=m,O=h,te=_,A=v):(S=l,C=c,T=f,E=d,ee=h,O=m,te=v,A=_)):b>=x?(w=c,D=d,k=m,ne=_,c>=0?(S=l,C=s,T=f,E=u,ee=h,O=p,te=v,A=g):(S=s,C=l,T=u,E=f,ee=p,O=h,te=g,A=v)):(w=l,D=f,k=h,ne=v,l>=0?(S=s,C=c,T=u,E=d,ee=p,O=m,te=g,A=_):(S=c,C=s,T=d,E=u,ee=m,O=p,te=_,A=g)),w===0)return null;let j=S/w,re=C/w,M=1/w,ie=T-j*D,ae=E-re*D,oe=ee-j*k,se=O-re*k,ce=te-j*ne,le=A-re*ne,ue=ce*se-le*oe,N=ie*le-ae*ce,de=oe*ae-se*ie;if(r){if(ue<0||N<0||de<0)return null}else if((ue<0||N<0||de<0)&&(ue>0||N>0||de>0))return null;let fe=ue+N+de;if(fe===0)return null;let pe=M*(ue*D+N*k+de*ne);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Sr=class extends gr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new W(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wt,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Cr=new Pt,wr=new xr,Tr=new nr,Er=new V,Dr=new V,Or=new V,kr=new V,Ar=new V,jr=new V,Mr=new V,Nr=new V,Pr=class extends cn{constructor(e=new ur,t=new Sr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){jr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Ar.fromBufferAttribute(s,e),a?jr.addScaledVector(Ar,r):jr.addScaledVector(Ar.sub(t),r))}t.add(jr)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Tr.copy(n.boundingSphere),Tr.applyMatrix4(i),wr.copy(e.ray).recast(e.near),!(Tr.containsPoint(wr.origin)===!1&&(wr.intersectSphere(Tr,Er)===null||wr.origin.distanceToSquared(Er)>(e.far-e.near)**2))&&(Cr.copy(i).invert(),wr.copy(e.ray).applyMatrix4(Cr),(n.boundingBox===null||wr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,wr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Ir(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Ir(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Ir(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Ir(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Fr(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Nr.copy(s),Nr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Nr);return l<n.near||l>n.far?null:{distance:l,point:Nr.clone(),object:e}}function Ir(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Dr),e.getVertexPosition(c,Or),e.getVertexPosition(l,kr);let u=Fr(e,t,n,r,Dr,Or,kr,Mr);if(u){let e=new V;An.getBarycoord(Mr,Dr,Or,kr,e),i&&(u.uv=An.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=An.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=An.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};An.getNormal(Dr,Or,kr,t.normal),u.face=t,u.barycoord=e}return u}var Lr=class extends Ot{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Rr=class extends Yn{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},zr=new Pt,Br=new Pt,Vr=[],Hr=new jn,Ur=new Pt,Wr=new Pr,Gr=new nr,Kr=class extends Pr{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Rr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ur)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,zr),Hr.copy(e.boundingBox).applyMatrix4(zr),this.boundingBox.union(Hr)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new nr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,zr),Gr.copy(e.boundingSphere).applyMatrix4(zr),this.boundingSphere.union(Gr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Wr.geometry=this.geometry,Wr.material=this.material,Wr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Gr.copy(this.boundingSphere),Gr.applyMatrix4(n),e.ray.intersectsSphere(Gr)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,zr),Br.multiplyMatrices(n,zr),Wr.matrixWorld=Br,Wr.raycast(e,Vr);for(let e=0,n=Vr.length;e<n;e++){let n=Vr[e];n.instanceId=i,n.object=this,t.push(n)}Vr.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Rr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Lr(new Float32Array(r*this.count),r,this.count,D,h));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},qr=new nr,Jr=new B(.5,.5),Yr=new V,Xr=class{constructor(e=new mr,t=new mr,n=new mr,r=new mr,i=new mr,a=new mr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ge,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),qr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),qr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(qr)}intersectsSprite(e){return qr.center.set(0,0,0),qr.radius=.7071067811865476+Jr.distanceTo(e.center),qr.applyMatrix4(e.matrixWorld),this.intersectsSphere(qr)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Yr.x=r.normal.x>0?e.max.x:e.min.x,Yr.y=r.normal.y>0?e.max.y:e.min.y,Yr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Yr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Zr=class extends gr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new W(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Qr=new V,$r=new V,ei=new Pt,ti=new xr,ni=new nr,ri=new V,ii=new V,ai=class extends cn{constructor(e=new ur,t=new Zr){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Qr.fromBufferAttribute(t,e-1),$r.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Qr.distanceTo($r);e.setAttribute(`lineDistance`,new Qn(n,1))}else L(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ni.copy(n.boundingSphere),ni.applyMatrix4(r),ni.radius+=i,e.ray.intersectsSphere(ni)===!1)return;ei.copy(r).invert(),ti.copy(e.ray).applyMatrix4(ei);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=oi(this,e,ti,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=oi(this,e,ti,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=oi(this,e,ti,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=oi(this,e,ti,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function oi(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Qr.fromBufferAttribute(s,i),$r.fromBufferAttribute(s,a),n.distanceSqToSegment(Qr,$r,ri,ii)>r)return;ri.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(ri);if(!(c<t.near||c>t.far))return{distance:c,point:ii.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var si=new V,ci=new V,li=class extends ai{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)si.fromBufferAttribute(t,e),ci.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+si.distanceTo(ci);e.setAttribute(`lineDistance`,new Qn(n,1))}else L(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},ui=class extends Ot{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},di=class extends Ot{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new wt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},fi=class extends di{constructor(e,t=m,n=301,i,a,o=r,s=r,c,l=T){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},pi=class extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},mi=class e extends ur{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Qn(c,3)),this.setAttribute(`normal`,new Qn(l,3)),this.setAttribute(`uv`,new Qn(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},hi=class e extends ur{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new Qn(o,3)),this.setAttribute(`normal`,new Qn(s,3)),this.setAttribute(`uv`,new Qn(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},gi=class e extends ur{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Qn(u,3)),this.setAttribute(`normal`,new Qn(d,3)),this.setAttribute(`uv`,new Qn(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},_i=class e extends gi{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},vi=class e extends ur{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Qn(i,3)),this.setAttribute(`normal`,new Qn(i.slice(),3)),this.setAttribute(`uv`,new Qn(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},yi=class e extends vi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=1/n,i=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r];super(i,[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9],e,t),this.type=`DodecahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},bi=class e extends vi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},xi=class e extends vi{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Si=class e extends ur{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Qn(p,3)),this.setAttribute(`normal`,new Qn(m,3)),this.setAttribute(`uv`,new Qn(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Ci=class e extends ur{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new V,d=new V,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Qn(p,3)),this.setAttribute(`normal`,new Qn(m,3)),this.setAttribute(`uv`,new Qn(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},wi=class e extends ur{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new V,f=new V,p=new V;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new Qn(c,3)),this.setAttribute(`normal`,new Qn(l,3)),this.setAttribute(`uv`,new Qn(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Ti(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Di(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Di(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Ei(e){let t={};for(let n=0;n<e.length;n++){let r=Ti(e[n]);for(let e in r)t[e]=r[e]}return t}function Di(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Oi(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ki(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:vt.workingColorSpace}var Ai={clone:Ti,merge:Ei},ji=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Mi=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ni=class extends gr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ji,this.fragmentShader=Mi,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ti(e.uniforms),this.uniformsGroups=Oi(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new W().setHex(r.value);break;case`v2`:this.uniforms[n].value=new B().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new kt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new H().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Pt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Pi=class extends Ni{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Fi=class extends gr{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:``},this.type=`MeshToonMaterial`,this.color=new W(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new W(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Ii=class extends gr{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type=`MeshNormalMaterial`,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}},Li=class extends gr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=I,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ri=class extends gr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function zi(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Bi(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Vi=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Hi=class extends Vi{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Le,endingEnd:Le}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case F:i=e,o=2*t-n;break;case Re:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case F:a=e,s=2*n-t;break;case Re:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Ui=class extends Vi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Wi=class extends Vi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Gi=class extends Vi{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Ji(n,t,g,y,r);i[p]=Ki(x,o,_,b,m)}return i}};function Ki(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function qi(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Ji(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Ki(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=qi(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Yi=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=zi(t,this.TimeBufferType),this.values=zi(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:zi(e.times,Array),values:zi(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Bi(e.settings)&&(n.settings={inTangents:zi(e.settings.inTangents,Array),outTangents:zi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wi(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ui(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Hi(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Gi(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Pe:t=this.InterpolantFactoryMethodDiscrete;break;case P:t=this.InterpolantFactoryMethodLinear;break;case Fe:t=this.InterpolantFactoryMethodSmooth;break;case Ie:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pe;case this.InterpolantFactoryMethodLinear:return P;case this.InterpolantFactoryMethodSmooth:return Fe;case this.InterpolantFactoryMethodBezier:return Ie}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Bi(this.settings)&&(Xi(this.settings.inTangents,e),Xi(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&qe(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Fe,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Bi(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Xi(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Yi.prototype.ValueTypeName=``,Yi.prototype.TimeBufferType=Float32Array,Yi.prototype.ValueBufferType=Float32Array,Yi.prototype.DefaultInterpolation=P;var Zi=class extends Yi{constructor(e,t,n){super(e,t,n)}};Zi.prototype.ValueTypeName=`bool`,Zi.prototype.ValueBufferType=Array,Zi.prototype.DefaultInterpolation=Pe,Zi.prototype.InterpolantFactoryMethodLinear=void 0,Zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Qi=class extends Yi{constructor(e,t,n,r){super(e,t,n,r)}};Qi.prototype.ValueTypeName=`color`;var $i=class extends Yi{constructor(e,t,n,r){super(e,t,n,r)}};$i.prototype.ValueTypeName=`number`;var ea=class extends Vi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)dt.slerpFlat(i,0,a,c-o,a,c,s);return i}},ta=class extends Yi{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ea(this.times,this.values,this.getValueSize(),e)}};ta.prototype.ValueTypeName=`quaternion`,ta.prototype.InterpolantFactoryMethodSmooth=void 0;var na=class extends Yi{constructor(e,t,n){super(e,t,n)}};na.prototype.ValueTypeName=`string`,na.prototype.ValueBufferType=Array,na.prototype.DefaultInterpolation=Pe,na.prototype.InterpolantFactoryMethodLinear=void 0,na.prototype.InterpolantFactoryMethodSmooth=void 0;var ra=class extends Yi{constructor(e,t,n,r){super(e,t,n,r)}};ra.prototype.ValueTypeName=`vector`;var ia=class extends cn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new W(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},aa=class extends ia{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(cn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new W(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},oa=new Pt,sa=new V,ca=new V,la=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=l,this.map=null,this.mapPass=null,this.matrix=new Pt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Xr,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new kt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;sa.setFromMatrixPosition(e.matrixWorld),t.position.copy(sa),ca.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ca),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){oa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(oa,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(oa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ua=new V,da=new dt,fa=new V,pa=class extends cn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Pt,this.projectionMatrix=new Pt,this.projectionMatrixInverse=new Pt,this.coordinateSystem=Ge,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ua,da,fa),fa.x===1&&fa.y===1&&fa.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ua,da,fa.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ua,da,fa),fa.x===1&&fa.y===1&&fa.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ua,da,fa.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ma=new V,ha=new B,ga=new B,_a=class extends pa{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=at*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(it*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return at*2*Math.atan(Math.tan(it*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ma.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ma.x,ma.y).multiplyScalar(-e/ma.z),ma.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ma.x,ma.y).multiplyScalar(-e/ma.z)}getViewSize(e,t){return this.getViewBounds(e,ha,ga),t.subVectors(ga,ha)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(it*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},va=class extends la{constructor(){super(new _a(90,1,.5,500)),this.isPointLightShadow=!0}},ya=class extends ia{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new va}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ba=class extends pa{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},xa=class extends la{constructor(){super(new ba(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Sa=class extends ia{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(cn.DEFAULT_UP),this.updateMatrix(),this.target=new cn,this.shadow=new xa}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Ca=-90,wa=1,Ta=class extends cn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new _a(Ca,wa,e,t);r.layers=this.layers,this.add(r);let i=new _a(Ca,wa,e,t);i.layers=this.layers,this.add(i);let a=new _a(Ca,wa,e,t);a.layers=this.layers,this.add(a);let o=new _a(Ca,wa,e,t);o.layers=this.layers,this.add(o);let s=new _a(Ca,wa,e,t);s.layers=this.layers,this.add(s);let c=new _a(Ca,wa,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Ea=class extends _a{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Da=`\\[\\]\\.:\\/`,Oa=RegExp(`[\\[\\]\\.:\\/]`,`g`),ka=`[^\\[\\]\\.:\\/]`,Aa=`[^`+Da.replace(`\\.`,``)+`]`,ja=`((?:WC+[\\/:])*)`.replace(`WC`,ka),Ma=`(WCOD+)?`.replace(`WCOD`,Aa),Na=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,ka),Pa=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,ka),Fa=RegExp(`^`+ja+Ma+Na+Pa+`$`),Ia=[`material`,`materials`,`bones`,`map`],La=class{constructor(e,t,n){let r=n||Ra.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ra=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Oa,``)}static parseTrackName(e){let t=Fa.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ia.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ra.Composite=La,Ra.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Ra.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Ra.prototype.GetterByBindingType=[Ra.prototype._getValue_direct,Ra.prototype._getValue_array,Ra.prototype._getValue_arrayElement,Ra.prototype._getValue_toArray],Ra.prototype.SetterByBindingTypeAndVersioning=[[Ra.prototype._setValue_direct,Ra.prototype._setValue_direct_setNeedsUpdate,Ra.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ra.prototype._setValue_array,Ra.prototype._setValue_array_setNeedsUpdate,Ra.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ra.prototype._setValue_arrayElement,Ra.prototype._setValue_arrayElement_setNeedsUpdate,Ra.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ra.prototype._setValue_fromArray,Ra.prototype._setValue_fromArray_setNeedsUpdate,Ra.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function za(e,t,n,r){let i=Ba(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case O:return e*t*2/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case A:case ne:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case j:case re:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ie:case oe:return Math.max(e,16)*Math.max(t,8)/4;case M:case ae:return Math.max(e,8)*Math.max(t,8)/2;case se:case ce:case ue:case N:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case le:case de:case fe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case me:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case he:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ge:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ve:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ye:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case be:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case xe:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ce:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case we:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Te:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ee:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case De:case Oe:case ke:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ae:case je:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Me:case Ne:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ba(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Va(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ha(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var G={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},K={common:{diffuse:{value:new W(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new W(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new V},probesMax:{value:new V},probesResolution:{value:new V}},points:{diffuse:{value:new W(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new W(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Ua={basic:{uniforms:Ei([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.fog]),vertexShader:G.meshbasic_vert,fragmentShader:G.meshbasic_frag},lambert:{uniforms:Ei([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new W(0)},envMapIntensity:{value:1}}]),vertexShader:G.meshlambert_vert,fragmentShader:G.meshlambert_frag},phong:{uniforms:Ei([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new W(0)},specular:{value:new W(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:G.meshphong_vert,fragmentShader:G.meshphong_frag},standard:{uniforms:Ei([K.common,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.roughnessmap,K.metalnessmap,K.fog,K.lights,{emissive:{value:new W(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:G.meshphysical_vert,fragmentShader:G.meshphysical_frag},toon:{uniforms:Ei([K.common,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.gradientmap,K.fog,K.lights,{emissive:{value:new W(0)}}]),vertexShader:G.meshtoon_vert,fragmentShader:G.meshtoon_frag},matcap:{uniforms:Ei([K.common,K.bumpmap,K.normalmap,K.displacementmap,K.fog,{matcap:{value:null}}]),vertexShader:G.meshmatcap_vert,fragmentShader:G.meshmatcap_frag},points:{uniforms:Ei([K.points,K.fog]),vertexShader:G.points_vert,fragmentShader:G.points_frag},dashed:{uniforms:Ei([K.common,K.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:G.linedashed_vert,fragmentShader:G.linedashed_frag},depth:{uniforms:Ei([K.common,K.displacementmap]),vertexShader:G.depth_vert,fragmentShader:G.depth_frag},normal:{uniforms:Ei([K.common,K.bumpmap,K.normalmap,K.displacementmap,{opacity:{value:1}}]),vertexShader:G.meshnormal_vert,fragmentShader:G.meshnormal_frag},sprite:{uniforms:Ei([K.sprite,K.fog]),vertexShader:G.sprite_vert,fragmentShader:G.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:G.background_vert,fragmentShader:G.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:G.backgroundCube_vert,fragmentShader:G.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:G.cube_vert,fragmentShader:G.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:G.equirect_vert,fragmentShader:G.equirect_frag},distance:{uniforms:Ei([K.common,K.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:G.distance_vert,fragmentShader:G.distance_frag},shadow:{uniforms:Ei([K.lights,K.fog,{color:{value:new W(0)},opacity:{value:1}}]),vertexShader:G.shadow_vert,fragmentShader:G.shadow_frag}};Ua.physical={uniforms:Ei([Ua.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new W(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new W(0)},specularColor:{value:new W(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:G.meshphysical_vert,fragmentShader:G.meshphysical_frag};var Wa={r:0,b:0,g:0},Ga=new Pt,Ka=new H;Ka.set(-1,0,0,0,1,0,0,0,1);function qa(e,t,n,r,i,a){let o=new W(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new Pr(new mi(1,1,1),new Ni({name:`BackgroundCubeMaterial`,uniforms:Ti(Ua.backgroundCube.uniforms),vertexShader:Ua.backgroundCube.vertexShader,fragmentShader:Ua.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ga.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Ka),l.material.toneMapped=vt.getTransfer(i.colorSpace)!==He,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Pr(new Si(2,2),new Ni({name:`BackgroundMaterial`,uniforms:Ti(Ua.background.uniforms),vertexShader:Ua.background.vertexShader,fragmentShader:Ua.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=vt.getTransfer(i.colorSpace)!==He,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Wa,ki(e)),n.buffers.color.setClear(Wa.r,Wa.g,Wa.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Ja(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Ya(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Xa(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Za(e){let t=this,n=null,r=0,i=!1,a=!1,o=new mr,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Qa=4,$a=6,eo=20,to=256,no=new ba,ro=new W,io=null,ao=0,oo=0,so=!1,co=new V,lo=new V,uo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=co}=i;io=this._renderer.getRenderTarget(),ao=this._renderer.getActiveCubeFace(),oo=this._renderer.getActiveMipmapLevel(),so=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_o(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(io,ao,oo),this._renderer.xr.enabled=so,e.scissorTest=!1,mo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),io=this._renderer.getRenderTarget(),ao=this._renderer.getActiveCubeFace(),oo=this._renderer.getActiveMipmapLevel(),so=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:Be,depthBuffer:!1},r=po(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=po(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=fo(r)),this._blurMaterial=go(r,e,t),this._ggxMaterial=ho(r,e,t)}return r}_compileMaterial(e){let t=new Pr(new ur,e);this._renderer.compile(t,no)}_sceneToCubeUV(e,t,n,r,i){let a=new _a(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(ro),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Pr(new mi,new Sr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(ro),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;mo(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=vo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_o());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;mo(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,no)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Qa?n-d+Qa:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,mo(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,no),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,mo(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,no)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];mo(t,3*l*(r>this._lodMax-Qa?r-this._lodMax+Qa:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,no)}};function fo(e){let t=[],n=[],r=e,i=e-Qa+1+$a;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?lo.set(1,r,n):e===1?lo.set(-n,1,-r):e===2?lo.set(-n,r,1):e===3?lo.set(-1,r,-n):e===4?lo.set(-n,-1,r):lo.set(n,r,-1),lo.toArray(l,(e*6+t)*3)}}let u=new ur;u.setAttribute(`position`,new Yn(c,3)),u.setAttribute(`outputDirection`,new Yn(l,3)),n.push(new Pr(u,null)),r>Qa&&r--}return{lodMeshes:n,sizeLods:t}}function po(e,t,n){let r=new jt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function mo(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function ho(e,t,n){return new Ni({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:to,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:yo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function go(e,t,n){return new Ni({name:`SphericalGaussianBlur`,defines:{SAMPLES:eo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:yo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function _o(){return new Ni({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:yo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function vo(){return new Ni({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:yo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function yo(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var bo=class extends jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ui(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new mi(5,5,5),i=new Ni({name:`CubemapFromEquirect`,uniforms:Ti(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Pr(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new Ta(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function xo(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new bo(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new uo(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new uo(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function So(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&$e(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Co(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?Zn:Xn)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function wo(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function To(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Eo(e,t,n){let r=new WeakMap,i=new kt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new Mt(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new B(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Do(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Oo={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function ko(e,t,n,r,i,a){let o=new jt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new ur;l.setAttribute(`position`,new Qn([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new Qn([0,2,0,0,2,0],2));let u=new Pi({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Pr(l,u),f=new ba(-1,1,1,-1,0,1),p=null,m=null,h=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new jt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}),c=new jt(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<y.length;e++){let r=y[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,h=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},vt.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=Oo[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(d,f),v=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Ao=new Ot,jo=new di(1,1),Mo=new Mt,No=new Nt,Po=new ui,Fo=[],Io=[],Lo=new Float32Array(16),Ro=new Float32Array(9),zo=new Float32Array(4);function Bo(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Fo[i];if(a===void 0&&(a=new Float32Array(i),Fo[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Vo(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Ho(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Uo(e,t){let n=Io[t];n===void 0&&(n=new Int32Array(t),Io[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Wo(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Go(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vo(n,t))return;e.uniform2fv(this.addr,t),Ho(n,t)}}function Ko(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Vo(n,t))return;e.uniform3fv(this.addr,t),Ho(n,t)}}function qo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vo(n,t))return;e.uniform4fv(this.addr,t),Ho(n,t)}}function Jo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vo(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Ho(n,t)}else{if(Vo(n,r))return;zo.set(r),e.uniformMatrix2fv(this.addr,!1,zo),Ho(n,r)}}function Yo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vo(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Ho(n,t)}else{if(Vo(n,r))return;Ro.set(r),e.uniformMatrix3fv(this.addr,!1,Ro),Ho(n,r)}}function Xo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vo(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Ho(n,t)}else{if(Vo(n,r))return;Lo.set(r),e.uniformMatrix4fv(this.addr,!1,Lo),Ho(n,r)}}function Zo(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Qo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vo(n,t))return;e.uniform2iv(this.addr,t),Ho(n,t)}}function $o(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Vo(n,t))return;e.uniform3iv(this.addr,t),Ho(n,t)}}function es(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vo(n,t))return;e.uniform4iv(this.addr,t),Ho(n,t)}}function ts(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vo(n,t))return;e.uniform2uiv(this.addr,t),Ho(n,t)}}function rs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Vo(n,t))return;e.uniform3uiv(this.addr,t),Ho(n,t)}}function is(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vo(n,t))return;e.uniform4uiv(this.addr,t),Ho(n,t)}}function as(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(jo.compareFunction=n.isReversedDepthBuffer()?518:515,a=jo):a=Ao,n.setTexture2D(t||a,i)}function os(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||No,i)}function ss(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Po,i)}function cs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Mo,i)}function ls(e){switch(e){case 5126:return Wo;case 35664:return Go;case 35665:return Ko;case 35666:return qo;case 35674:return Jo;case 35675:return Yo;case 35676:return Xo;case 5124:case 35670:return Zo;case 35667:case 35671:return Qo;case 35668:case 35672:return $o;case 35669:case 35673:return es;case 5125:return ts;case 36294:return ns;case 36295:return rs;case 36296:return is;case 35678:case 36198:case 36298:case 36306:case 35682:return as;case 35679:case 36299:case 36307:return os;case 35680:case 36300:case 36308:case 36293:return ss;case 36289:case 36303:case 36311:case 36292:return cs}}function us(e,t){e.uniform1fv(this.addr,t)}function ds(e,t){let n=Bo(t,this.size,2);e.uniform2fv(this.addr,n)}function fs(e,t){let n=Bo(t,this.size,3);e.uniform3fv(this.addr,n)}function ps(e,t){let n=Bo(t,this.size,4);e.uniform4fv(this.addr,n)}function ms(e,t){let n=Bo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function hs(e,t){let n=Bo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function gs(e,t){let n=Bo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function _s(e,t){e.uniform1iv(this.addr,t)}function vs(e,t){e.uniform2iv(this.addr,t)}function ys(e,t){e.uniform3iv(this.addr,t)}function bs(e,t){e.uniform4iv(this.addr,t)}function xs(e,t){e.uniform1uiv(this.addr,t)}function Ss(e,t){e.uniform2uiv(this.addr,t)}function Cs(e,t){e.uniform3uiv(this.addr,t)}function ws(e,t){e.uniform4uiv(this.addr,t)}function Ts(e,t,n){let r=this.cache,i=t.length,a=Uo(n,i);Vo(r,a)||(e.uniform1iv(this.addr,a),Ho(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?jo:Ao;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Es(e,t,n){let r=this.cache,i=t.length,a=Uo(n,i);Vo(r,a)||(e.uniform1iv(this.addr,a),Ho(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||No,a[e])}function Ds(e,t,n){let r=this.cache,i=t.length,a=Uo(n,i);Vo(r,a)||(e.uniform1iv(this.addr,a),Ho(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Po,a[e])}function Os(e,t,n){let r=this.cache,i=t.length,a=Uo(n,i);Vo(r,a)||(e.uniform1iv(this.addr,a),Ho(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Mo,a[e])}function ks(e){switch(e){case 5126:return us;case 35664:return ds;case 35665:return fs;case 35666:return ps;case 35674:return ms;case 35675:return hs;case 35676:return gs;case 5124:case 35670:return _s;case 35667:case 35671:return vs;case 35668:case 35672:return ys;case 35669:case 35673:return bs;case 5125:return xs;case 36294:return Ss;case 36295:return Cs;case 36296:return ws;case 35678:case 36198:case 36298:case 36306:case 35682:return Ts;case 35679:case 36299:case 36307:return Es;case 35680:case 36300:case 36308:case 36293:return Ds;case 36289:case 36303:case 36311:case 36292:return Os}}var As=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ls(t.type)}},js=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ks(t.type)}},Ms=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ns=/(\w+)(\])?(\[|\.)?/g;function Ps(e,t){e.seq.push(t),e.map[t.id]=t}function Fs(e,t,n){let r=e.name,i=r.length;for(Ns.lastIndex=0;;){let a=Ns.exec(r),o=Ns.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Ps(n,l===void 0?new As(s,e,t):new js(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ms(s),Ps(n,e)),n=e}}}var Is=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Fs(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Ls(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Rs=37297,zs=0;function Bs(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Vs=new H;function Hs(e){vt._getMatrix(Vs,vt.workingColorSpace,e);let t=`mat3( ${Vs.elements.map(e=>e.toFixed(4))} )`;switch(vt.getTransfer(e)){case Ve:return[t,`LinearTransferOETF`];case He:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Us(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Bs(e.getShaderSource(t),r)}return i}function Ws(e,t){let n=Hs(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Gs={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Ks(e,t){let n=Gs[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var qs=new V;function Js(){return vt.getLuminanceCoefficients(qs),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${qs.x.toFixed(4)}, ${qs.y.toFixed(4)}, ${qs.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ys(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Qs).join(`
`)}function Xs(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Zs(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Qs(e){return e!==``}function $s(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ec(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var tc=/^[ \t]*#include +<([\w\d./]+)>/gm;function nc(e){return e.replace(tc,ic)}var rc=new Map;function ic(e,t){let n=G[t];if(n===void 0){let e=rc.get(t);if(e!==void 0)n=G[e],L(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return nc(n)}var ac=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function oc(e){return e.replace(ac,sc)}function sc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function cc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var lc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function uc(e){return lc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var dc={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function fc(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:dc[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var pc={302:`ENVMAP_MODE_REFRACTION`};function mc(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:pc[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var hc={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function gc(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:hc[e.combine]||`ENVMAP_BLENDING_NONE`}function _c(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function vc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=uc(n),l=fc(n),u=mc(n),d=gc(n),f=_c(n),p=Ys(n),m=Xs(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Qs).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Qs).join(`
`),_.length>0&&(_+=`
`)):(g=[cc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Qs).join(`
`),_=[cc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:G.tonemapping_pars_fragment,n.toneMapping===0?``:Ks(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,G.colorspace_pars_fragment,Ws(`linearToOutputTexel`,n.outputColorSpace),Js(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Qs).join(`
`)),o=nc(o),o=$s(o,n),o=ec(o,n),s=nc(s),s=$s(s,n),s=ec(s,n),o=oc(o),s=oc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Ls(i,i.VERTEX_SHADER,y),S=Ls(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Us(i,x,`vertex`),n=Us(i,S,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Is(i,h),T=Zs(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Rs)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=zs++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var yc=0,bc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new xc(e),t.set(e,n)),n}},xc=class{constructor(e){this.id=yc++,this.code=e,this.usedTimes=0}};function Sc(e){return e===1030||e===37490||e===36285}function Cc(e,t,n,r,i,a){let o=new Gt,s=new bc,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,ee,O,k;if(C){let e=Ua[C];D=e.vertexShader,ee=e.fragmentShader}else{D=i.vertexShader,ee=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let te=e.getRenderTarget(),A=e.state.buffers.depth.getReversed(),ne=h.isInstancedMesh===!0,j=h.isBatchedMesh===!0,re=!!i.map,M=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,N=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.retroreflectivity>0,ge=i.iridescence>0,_e=i.sheen>0,ve=i.transmission>0,ye=fe&&!!i.anisotropyMap,be=pe&&!!i.clearcoatMap,xe=pe&&!!i.clearcoatNormalMap,Se=pe&&!!i.clearcoatRoughnessMap,Ce=ge&&!!i.iridescenceMap,we=ge&&!!i.iridescenceThicknessMap,Te=_e&&!!i.sheenColorMap,Ee=_e&&!!i.sheenRoughnessMap,De=!!i.specularMap,Oe=!!i.specularColorMap,ke=!!i.specularIntensityMap,Ae=ve&&!!i.transmissionMap,je=ve&&!!i.thicknessMap,Me=!!i.gradientMap,Ne=!!i.alphaMap,Pe=i.alphaTest>0,P=!!i.alphaHash,Fe=!!i.extensions,Ie=0;i.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let Le={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:ee,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:j,batchingColor:j&&h._colorsTexture!==null,instancing:ne,instancingColor:ne&&h.instanceColor!==null,instancingMorph:ne&&h.morphTexture!==null,outputColorSpace:te===null?e.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:vt.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:M,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&Sc(i.normalMap.format),metalnessMap:N,roughnessMap:de,anisotropy:fe,anisotropyMap:ye,clearcoat:pe,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:Se,dispersion:me,retroreflection:he,iridescence:ge,iridescenceMap:Ce,iridescenceThicknessMap:we,sheen:_e,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:Oe,specularIntensityMap:ke,transmission:ve,transmissionMap:Ae,thicknessMap:je,gradientMap:Me,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ne,alphaTest:Pe,alphaHash:P,combine:i.combine,mapUv:re&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:le&&m(i.displacementMap.channel),emissiveMapUv:ue&&m(i.emissiveMap.channel),metalnessMapUv:N&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ye&&m(i.anisotropyMap.channel),clearcoatMapUv:be&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:xe&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:we&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(i.sheenRoughnessMap.channel),specularMapUv:De&&m(i.specularMap.channel),specularColorMapUv:Oe&&m(i.specularColorMap.channel),specularIntensityMapUv:ke&&m(i.specularIntensityMap.channel),transmissionMapUv:Ae&&m(i.transmissionMap.channel),thicknessMapUv:je&&m(i.thicknessMap.channel),alphaMapUv:Ne&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(ce||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(re||Ne),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:A,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&vt.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&vt.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Fe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&i.extensions.multiDraw===!0||j)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Le.vertexUv1s=c.has(1),Le.vertexUv2s=c.has(2),Le.vertexUv3s=c.has(3),c.clear(),Le}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Ua[t];n=Ai.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new vc(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function wc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Tc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ec(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Dc(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Tc),r.length>1&&r.sort(t||Ec),i.length>1&&i.sort(t||Ec)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Oc(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Dc,e.set(t,[i])):n>=r.length?(i=new Dc,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function kc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new V,color:new W};break;case`SpotLight`:n={position:new V,direction:new V,color:new W,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new W,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new W,groundColor:new W};break;case`RectAreaLight`:n={color:new W,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Ac(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var jc=0;function Mc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Nc(e){let t=new kc,n=Ac(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new Pt,o=new Pt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Mc);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=K.LTC_FLOAT_1,r.rectAreaLTC2=K.LTC_FLOAT_2):(r.rectAreaLTC1=K.LTC_HALF_1,r.rectAreaLTC2=K.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=jc++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Pc(e){let t=new Nc(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Fc(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Pc(e),t.set(n,[a])):r>=i.length?(a=new Pc(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Ic=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Rc=[new V(1,0,0),new V(-1,0,0),new V(0,1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1)],zc=[new V(0,-1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1),new V(0,-1,0),new V(0,-1,0)],Bc=new Pt,Vc=new V,Hc=new V;function Uc(e,t,n){let i=new Xr,a=new B,s=new B,c=new kt,l=new Li,u=new Ri,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},_=new Ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Ic,fragmentShader:Lc}),v=_.clone();v.defines.HORIZONTAL_PASS=1;let y=new ur;y.setAttribute(`position`,new Yn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new Pr(y,_),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.state;_.setBlending(0),_.buffers.depth.getReversed()===!0?_.buffers.color.setClear(0,0,0,0):_.buffers.color.setClear(1,1,1,1),_.buffers.depth.setTest(!0),_.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){L(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),s.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/y.x),a.x=s.x*y.x,p.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/y.y),a.y=s.y*y.y,p.mapSize.y=s.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new jt(a.x,a.y,{format:O,type:g,minFilter:o,magFilter:o,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new di(a.x,a.y,h),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=T,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r}else d.isPointLight?(p.map=new bo(a.x),p.map.depthTexture=new fi(a.x,m)):(p.map=new jt(a.x,a.y),p.map.depthTexture=new di(a.x,a.y,m)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=T,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);for(let t=0;t<x;t++){let r=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Vc.setFromMatrixPosition(d.matrixWorld),e.position.copy(Vc),Hc.copy(e.position),Hc.add(Rc[t]),e.up.copy(zc[t]),e.lookAt(Hc),e.updateMatrixWorld(),n.makeTranslation(-Vc.x,-Vc.y,-Vc.z),Bc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Bc,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(s.x*n.x,s.y*n.y,s.x*n.z,s.y*n.w),_.viewport(c)}i=p.getFrustum(t),E(n,l,r,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);_.defines.VSM_SAMPLES!==n.blurSamples&&(_.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,_.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null?n.mapPass=new jt(a.x,a.y,{format:O,type:g}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),_.uniforms.shadow_pass.value=n.map.depthTexture,_.uniforms.resolution.value.set(n.map.width,n.map.height),_.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,_,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function E(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(i))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)E(c[e],r,a,o,s)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Wc(e,t){function n(){let t=!1,n=new kt,r=null,i=new kt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?N(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=tt[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?N(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new W(0,0,0),T=0,E=!1,D=null,ee=null,O=null,k=null,te=null,A=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ne=!1,j=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),ne=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(re)[1]),ne=j>=1);let M=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new kt().fromArray(ae),ce=new kt().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),N(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),N(e.CULL_FACE),_e(0);function N(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(de(e.BLEND),g=!1);else if(g===!1&&(N(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):N(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?N(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(N(e.CULL_FACE),t!==ee&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),ee=t}function xe(t){t!==O&&(ne&&e.lineWidth(t),O=t)}function Se(t,n,r){t?(N(e.POLYGON_OFFSET_FILL),(k!==n||te!==r)&&(k=n,te=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?N(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+A-1),M!==t&&(e.activeTexture(t),M=t)}function Te(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+A-1:M);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function P(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function F(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Re(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function I(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ze(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},M=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new W(0,0,0),T=0,E=!1,D=null,ee=null,O=null,k=null,te=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:N,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:P,texImage3D:Fe,pixelStorei:Le,getParameter:Ie,updateUBOMapping:I,uniformBlockBinding:ze,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:F,viewport:Re,reset:Be}}function Gc(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new B,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Je(`canvas`)}function T(e,t,n){let r=1,i=Ie(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function D(e){return e.generateMipmaps}function ee(e){l.generateMipmap(e)}function O(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function k(e,t,n,r,i,a=!1){if(e!==null){if(l[e]!==void 0)return l[e];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let o;r&&(o=u.get(`EXT_texture_norm16`),o||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let s=t;if(t===l.RED&&(n===l.FLOAT&&(s=l.R32F),n===l.HALF_FLOAT&&(s=l.R16F),n===l.UNSIGNED_BYTE&&(s=l.R8),n===l.UNSIGNED_SHORT&&o&&(s=o.R16_EXT),n===l.SHORT&&o&&(s=o.R16_SNORM_EXT)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.R8UI),n===l.UNSIGNED_SHORT&&(s=l.R16UI),n===l.UNSIGNED_INT&&(s=l.R32UI),n===l.BYTE&&(s=l.R8I),n===l.SHORT&&(s=l.R16I),n===l.INT&&(s=l.R32I)),t===l.RG&&(n===l.FLOAT&&(s=l.RG32F),n===l.HALF_FLOAT&&(s=l.RG16F),n===l.UNSIGNED_BYTE&&(s=l.RG8),n===l.UNSIGNED_SHORT&&o&&(s=o.RG16_EXT),n===l.SHORT&&o&&(s=o.RG16_SNORM_EXT)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RG8UI),n===l.UNSIGNED_SHORT&&(s=l.RG16UI),n===l.UNSIGNED_INT&&(s=l.RG32UI),n===l.BYTE&&(s=l.RG8I),n===l.SHORT&&(s=l.RG16I),n===l.INT&&(s=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGB8UI),n===l.UNSIGNED_SHORT&&(s=l.RGB16UI),n===l.UNSIGNED_INT&&(s=l.RGB32UI),n===l.BYTE&&(s=l.RGB8I),n===l.SHORT&&(s=l.RGB16I),n===l.INT&&(s=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(s=l.RGBA16UI),n===l.UNSIGNED_INT&&(s=l.RGBA32UI),n===l.BYTE&&(s=l.RGBA8I),n===l.SHORT&&(s=l.RGBA16I),n===l.INT&&(s=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_SHORT&&o&&(s=o.RGB16_EXT),n===l.SHORT&&o&&(s=o.RGB16_SNORM_EXT),n===l.UNSIGNED_INT_5_9_9_9_REV&&(s=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(s=l.R11F_G11F_B10F)),t===l.RGBA){let e=a?Ve:vt.getTransfer(i);n===l.FLOAT&&(s=l.RGBA32F),n===l.HALF_FLOAT&&(s=l.RGBA16F),n===l.UNSIGNED_BYTE&&(s=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT&&o&&(s=o.RGBA16_EXT),n===l.SHORT&&o&&(s=o.RGBA16_SNORM_EXT),n===l.UNSIGNED_SHORT_4_4_4_4&&(s=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(s=l.RGB5_A1)}return(s===l.R16F||s===l.R32F||s===l.RG16F||s===l.RG32F||s===l.RGBA16F||s===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),s}function te(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function A(e,t){return D(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function ne(e){let t=e.target;t.removeEventListener(`dispose`,ne),re(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),ie(t)}function re(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&M(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function M(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=S.get(n);delete r[t.__cacheKey],h.memory.textures--}function ie(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let ae=0;function oe(){ae=0}function se(){return ae}function ce(e){ae=e}function le(){let e=ae;return e>=p.maxTextures&&L(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),ae+=1,e}function ue(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function N(e,t){let n=f.get(e);if(e.isVideoTexture&&P(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{xe(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function de(e,t){let n=f.get(e);e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version?xe(n,e,t):(e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null),d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t))}function fe(e,t){let n=f.get(e);e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version?xe(n,e,t):d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function pe(e,t){let n=f.get(e);e.isCubeDepthTexture!==!0&&e.version>0&&n.__version!==e.version?Se(n,e,t):d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let me={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},he={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},ge={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function _e(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,me[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,me[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,me[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,he[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,he[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,ge[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function ve(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,ne));let r=t.source,i=S.get(r);i===void 0&&(i={},S.set(r,i));let a=ue(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&M(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function ye(e,t,n){return Math.floor(Math.floor(e/n)/t)}function be(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=ye(r.start,t.width,4),c=ye(n.start,t.width,4);r.start<=o+1&&s===c&&ye(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=d.getParameter(l.UNPACK_ROW_LENGTH),s=d.getParameter(l.UNPACK_SKIP_PIXELS),c=d.getParameter(l.UNPACK_SKIP_ROWS);d.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;d.pixelStorei(l.UNPACK_SKIP_PIXELS,c),d.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),d.pixelStorei(l.UNPACK_ROW_LENGTH,o),d.pixelStorei(l.UNPACK_SKIP_PIXELS,s),d.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function xe(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=ve(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){if(d.activeTexture(l.TEXTURE0+n),!(typeof ImageBitmap<`u`&&t.image instanceof ImageBitmap)){let e=vt.getPrimaries(vt.workingColorSpace),n=t.colorSpace===``?null:vt.getPrimaries(t.colorSpace),r=t.colorSpace===``||e===n?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,r)}d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment);let e=T(t.image,!1,p.maxTextureSize);e=Fe(t,e);let s=m.convert(t.format,t.colorSpace),c=m.convert(t.type),u=k(t.internalFormat,s,c,t.normalized,t.colorSpace,t.isVideoTexture);_e(r,t);let f,h=t.mipmaps,g=t.isVideoTexture!==!0,_=o.__version===void 0||i===!0,v=a.dataReady,y=A(t,e);if(t.isDepthTexture)u=te(t.format===E,t.type),_&&(g?d.texStorage2D(l.TEXTURE_2D,1,u,e.width,e.height):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,null));else if(t.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data);t.generateMipmaps=!1}else g?(_&&d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height),v&&be(t,e,s,c)):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,e.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){g&&_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,e.depth);for(let n=0,r=h.length;n<r;n++)if(f=h[n],t.format!==1023){if(s!==null){if(g){if(v){if(t.layerUpdates.size>0){let e=za(f.width,f.height,t.format,t.type);for(let r of t.layerUpdates){let t=f.data.subarray(r*e/f.data.BYTES_PER_ELEMENT,(r+1)*e/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,r,f.width,f.height,1,s,t)}}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,f.data)}}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,f.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,c,f.data):d.texImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,s,c,f.data);t.layerUpdates.size>0&&t.clearLayerUpdates()}else{g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,n=h.length;e<n;e++)f=h[e],t.format===1023?g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data):s===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,f.data):d.compressedTexImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,f.data)}}else if(t.isDataArrayTexture){if(g){if(_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,e.width,e.height,e.depth),v){if(t.layerUpdates.size>0){let n=za(e.width,e.height,t.format,t.type);for(let r of t.layerUpdates){let t=e.data.subarray(r*n/e.data.BYTES_PER_ELEMENT,(r+1)*n/e.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,s,c,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)}}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,u,e.width,e.height,e.depth,0,s,c,e.data)}else if(t.isData3DTexture)g?(_&&d.texStorage3D(l.TEXTURE_3D,y,u,e.width,e.height,e.depth),v&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)):d.texImage3D(l.TEXTURE_3D,0,u,e.width,e.height,e.depth,0,s,c,e.data);else if(t.isFramebufferTexture){if(_){if(g)d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height);else{let t=e.width,n=e.height;for(let e=0;e<y;e++)d.texImage2D(l.TEXTURE_2D,e,u,t,n,0,s,c,null),t>>=1,n>>=1}}}else if(t.isHTMLTexture){if(`texElementImage2D`in l){let n=l.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),e.parentNode!==n){n.appendChild(e),b.add(t),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(l.texElementImage2D.length===3)l.texElementImage2D(l.TEXTURE_2D,l.RGBA8,e);else{let t=l.RGBA,n=l.RGBA,r=l.UNSIGNED_BYTE;l.texElementImage2D(l.TEXTURE_2D,0,t,n,r,e)}l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let e=Ie(h[0]);d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height)}for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,s,c,f):d.texImage2D(l.TEXTURE_2D,e,u,s,c,f);t.generateMipmaps=!1}else if(g){if(_){let t=Ie(e);d.texStorage2D(l.TEXTURE_2D,y,u,t.width,t.height)}v&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,s,c,e)}else d.texImage2D(l.TEXTURE_2D,0,u,s,c,e);D(t)&&ee(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Se(e,t,n){if(t.image.length!==6)return;let r=ve(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=vt.getPrimaries(vt.workingColorSpace),o=t.colorSpace===``?null:vt.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=T(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=Fe(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=k(t.internalFormat,g,_,t.normalized,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=A(t,h);_e(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=Ie(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}D(t)&&ee(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Ce(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=k(n.internalFormat,o,s,n.normalized,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,Ne(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function we(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=te(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;Pe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,Ne(t),a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,Ne(t),a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=k(i.internalFormat,a,o,i.normalized,i.colorSpace);Pe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,Ne(t),s,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,Ne(t),s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function Te(e,t,n){let r=t.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let i=f.get(t.depthTexture);if(i.__renderTarget=t,(!i.__webglTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height)&&(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),r){if(i.__webglInit===void 0&&(i.__webglInit=!0,t.depthTexture.addEventListener(`dispose`,ne)),i.__webglTexture===void 0){i.__webglTexture=l.createTexture(),d.bindTexture(l.TEXTURE_CUBE_MAP,i.__webglTexture),_e(l.TEXTURE_CUBE_MAP,t.depthTexture);let e=m.convert(t.depthTexture.format),n=m.convert(t.depthTexture.type),r;t.depthTexture.format===1026?r=l.DEPTH_COMPONENT24:t.depthTexture.format===1027&&(r=l.DEPTH24_STENCIL8);for(let i=0;i<6;i++)l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+i,0,r,t.width,t.height,0,e,n,null)}}else N(t.depthTexture,0);let a=i.__webglTexture,o=Ne(t),s=r?l.TEXTURE_CUBE_MAP_POSITIVE_X+n:l.TEXTURE_2D,c=t.depthTexture.format===1027?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;if(t.depthTexture.format===1026)Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else if(t.depthTexture.format===1027)Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ee(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)for(let n=0;n<6;n++)Te(t.__webglFramebuffer[n],e,n);else{let n=e.texture.mipmaps;n&&n.length>0?Te(t.__webglFramebuffer[0],e,0):Te(t.__webglFramebuffer,e,0)}}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),we(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),we(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function De(e,t,n){let r=f.get(e);t!==void 0&&Ce(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&Ee(e)}function Oe(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,j);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Pe(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=k(r.internalFormat,a,o,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),c=Ne(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),we(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),_e(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)Ce(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else Ce(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);D(t)&&ee(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),_e(o,r),Ce(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),D(r)&&ee(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),_e(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)Ce(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else Ce(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);D(t)&&ee(i),d.unbindTexture()}e.depthBuffer&&Ee(e)}function ke(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(D(r)){let t=O(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),ee(t),d.unbindTexture()}}}let Ae=[],je=[];function Me(e){if(e.samples>0){if(Pe(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(Ae.length=0,je.length=0,Ae.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&(Ae.push(a),je.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,je)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,Ae))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function Ne(e){return Math.min(p.maxSamples,e.samples)}function Pe(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function P(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Fe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(vt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ie(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=le,this.resetTextureUnits=oe,this.getTextureUnits=se,this.setTextureUnits=ce,this.setTexture2D=N,this.setTexture2DArray=de,this.setTexture3D=fe,this.setTextureCube=pe,this.rebindTextures=De,this.setupRenderTarget=Oe,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return d.buffers.depth.getReversed()}}function Kc(e,t){function n(n,r=``){let i,a=vt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var qc=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Jc=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new pi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ni({vertexShader:qc,fragmentShader:Jc,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Pr(new Si(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Xc=class extends nt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new Yc,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],ee=new B,O=null,k=null,te=new _a;te.viewport=new kt;let A=new _a;A.viewport=new kt;let ne=[te,A],j=new Ea,re=null,M=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new un,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new un,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new un,C[e]=t),t.getHandSpace()};function ie(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ae(){r.removeEventListener(`select`,ie),r.removeEventListener(`selectstart`,ie),r.removeEventListener(`selectend`,ie),r.removeEventListener(`squeeze`,ie),r.removeEventListener(`squeezestart`,ie),r.removeEventListener(`squeezeend`,ie),r.removeEventListener(`end`,ae),r.removeEventListener(`inputsourceschange`,oe);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}re=null,M=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(O),e.setSize(ee.width,ee.height,!1),k!==null){let e=k.camera;e.fov=k.fov,e.zoom=k.zoom,e.updateProjectionMatrix(),k=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,ie),r.addEventListener(`selectstart`,ie),r.addEventListener(`selectend`,ie),r.addEventListener(`squeeze`,ie),r.addEventListener(`squeezestart`,ie),r.addEventListener(`squeezeend`,ie),r.addEventListener(`end`,ae),r.addEventListener(`inputsourceschange`,oe),b.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(ee),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new jt(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new di(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new jt(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function oe(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let se=new V,ce=new V;function le(e,t,n){se.setFromMatrixPosition(t.matrixWorld),ce.setFromMatrixPosition(n.matrixWorld);let r=se.distanceTo(ce),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ue(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=A.near=te.near=t,j.far=A.far=te.far=n,(re!==j.near||M!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),re=j.near,M=j.far),j.layers.mask=e.layers.mask|6,te.layers.mask=j.layers.mask&-5,A.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;ue(j,i);for(let e=0;e<a.length;e++)ue(a[e],i);a.length===2?le(j,te,A):j.projectionMatrix.copy(te.projectionMatrix),k===null&&e.isPerspectiveCamera&&(k={camera:e,fov:e.fov,zoom:e.zoom}),N(e,j,i)};function N(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=at*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let de=null;function fe(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=ne[n];o===void 0&&(o=new _a,o.layers.enable(n),o.viewport=new kt,ne[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new pi,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}de&&de(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let pe=new Va;pe.setAnimationLoop(fe),this.setAnimationLoop=function(e){de=e},this.dispose=function(){}}},Zc=new Pt,Qc=new H;Qc.set(-1,0,0,0,1,0,0,0,1);function $c(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ki(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Zc.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Qc),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function el(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return R(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var tl=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),nl=null;function rl(){return nl===null&&(nl=new Lr(tl,16,16,O,g),nl.name=`DFG_LUT`,nl.minFilter=o,nl.magFilter=o,nl.wrapS=t,nl.wrapT=t,nl.generateMipmaps=!1,nl.needsUpdate=!0),nl}var il=class{constructor(e={}){let{canvas:t=Ye(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:b=l}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=b,C=new Set([te,k,ee]),w=new Set([l,m,f,y,_,v]),T=new Uint32Array(4),E=new Int32Array(4),D=new V,O=null,A=null,ne=[],j=[],re=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ie=!1,ae=null,oe=null,se=null,ce=null;this._outputColorSpace=ze;let le=0,ue=0,N=null,de=-1,fe=null,pe=new kt,me=new kt,he=null,ge=new W(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new kt(0,0,ve,ye),we=new kt(0,0,ve,ye),Te=!1,Ee=new Xr,De=!1,Oe=!1,ke=new Pt,Ae=new V,je=new kt,Me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function Pe(){return N===null?be:1}let P=n;function Fe(e,n){return t.getContext(e,n)}let Ie,Le,F,Re,I,Be,Ve,He,Ue,We,Ke,qe,Je,Xe,Qe,$e,tt,nt,rt,it,at,ot,z;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:p};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,lt,!1),t.addEventListener(`webglcontextrestored`,ut,!1),t.addEventListener(`webglcontextcreationerror`,B,!1),P===null){let t=`webgl2`;if(P=Fe(t,e),P===null)throw Fe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}st()}catch(e){throw t.removeEventListener(`webglcontextlost`,lt,!1),t.removeEventListener(`webglcontextrestored`,ut,!1),t.removeEventListener(`webglcontextcreationerror`,B,!1),R(`WebGLRenderer: `+e.message),e}function st(){Ie=new So(P),Ie.init(),at=new Kc(P,Ie),Le=new Xa(P,Ie,e,at),F=new Wc(P,Ie),Le.reversedDepthBuffer&&h&&F.buffers.depth.setReversed(!0),oe=P.createFramebuffer(),se=P.createFramebuffer(),ce=P.createFramebuffer(),Re=new To(P),I=new wc,Be=new Gc(P,Ie,F,I,Le,at,Re),Ve=new xo(M),He=new Ha(P),ot=new Ja(P,He),Ue=new Co(P,He,Re,ot),We=new Do(P,Ue,He,ot,Re),nt=new Eo(P,Le,Be),Qe=new Za(I),Ke=new Cc(M,Ve,Ie,Le,ot,Qe),qe=new $c(M,I),Je=new Oc,Xe=new Fc(Ie),tt=new qa(M,Ve,F,We,x,s),$e=new Uc(M,We,Le),z=new el(P,Re,Le,F),rt=new Ya(P,Ie,Re),it=new wo(P,Ie,Re),Re.programs=Ke.programs,M.capabilities=Le,M.extensions=Ie,M.properties=I,M.renderLists=Je,M.shadowMap=$e,M.state=F,M.info=Re}S!==1009&&(re=new ko(S,t.width,t.height,o,r,i));let ct=new Xc(M,P);this.xr=ct,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){ct.isPresenting?L(`WebGLRenderer: Can't change size while VR device is presenting.`):(ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),re!==null&&re.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009)R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}re.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),F.viewport(pe.copy(Ce).multiplyScalar(be).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),F.scissor(me.copy(we).multiplyScalar(be).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){F.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy(tt.getClearColor())},this.setClearColor=function(){tt.setClearColor(...arguments)},this.getClearAlpha=function(){return tt.getClearAlpha()},this.setClearAlpha=function(){tt.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=C.has(t)}if(e){let e=N.texture.type,t=w.has(e),n=tt.getClearColor(),r=tt.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,P.clearBufferuiv(P.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,P.clearBufferiv(P.COLOR,0,E))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ae=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,lt,!1),t.removeEventListener(`webglcontextrestored`,ut,!1),t.removeEventListener(`webglcontextcreationerror`,B,!1),tt.dispose(),Je.dispose(),Xe.dispose(),I.dispose(),Ve.dispose(),We.dispose(),ot.dispose(),z.dispose(),Ke.dispose(),ct.dispose(),ct.removeEventListener(`sessionstart`,gt),ct.removeEventListener(`sessionend`,_t),yt.stop()};function lt(e){e.preventDefault(),Ze(`WebGLRenderer: Context Lost.`),ie=!0}function ut(){Ze(`WebGLRenderer: Context Restored.`),ie=!1;let e=Re.autoReset,t=$e.enabled,n=$e.autoUpdate,r=$e.needsUpdate,i=$e.type;st(),Re.autoReset=e,$e.enabled=t,$e.autoUpdate=n,$e.needsUpdate=r,$e.type=i}function B(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function dt(e){let t=e.target;t.removeEventListener(`dispose`,dt),ft(t)}function ft(e){pt(e),I.remove(e)}function pt(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ke.releaseProgram(e)}),e.isShaderMaterial&&Ke.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Me);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=At(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ot.setup(i,r,s,n,c);let h,g=rt;if(c!==null&&(h=He.get(c),g=it,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Pe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Pe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Ie.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?He.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function H(e,t,n,r){ae!==null&&e.isNodeMaterial&&ae.setObject(r,e),De===!0&&Qe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Tt(e,t,r),e.side=0,e.needsUpdate=!0,Tt(e,t,r),e.side=2):Tt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),ae!==null&&ae.renderStart(e,t,n),A=Xe.get(n),A.init(t),j.push(A),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(A.pushLight(e),e.castShadow&&A.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(A.pushLight(e),e.castShadow&&A.pushShadow(e))}),A.setupLights(),ae!==null&&ae.updateLights(A.state.lightsArray),Oe=this.localClippingEnabled,De=Qe.init(this.clippingPlanes,Oe),De===!0&&Qe.setGlobalState(this.clippingPlanes,t),ae!==null&&$e.render(A.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];H(o,n,t,e),r.add(o)}else H(i,n,t,e),r.add(i)}}),A=j.pop(),ae!==null&&ae.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=I.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ie.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let mt=null;function ht(e){mt&&mt(e)}function gt(){yt.stop()}function _t(){yt.start()}let yt=new Va;yt.setAnimationLoop(ht),typeof self<`u`&&yt.setContext(self),this.setAnimationLoop=function(e){mt=e,ct.setAnimationLoop(e),e===null?yt.stop():yt.start()},ct.addEventListener(`sessionstart`,gt),ct.addEventListener(`sessionend`,_t),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ie===!0)return;ae!==null&&ae.renderStart(e,t);let n=ct.enabled===!0&&ct.isPresenting===!0,r=re!==null&&(N===null||n)&&re.begin(M,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),ct.enabled===!0&&ct.isPresenting===!0&&(re===null||re.isCompositing()===!1)&&(ct.cameraAutoUpdate===!0&&ct.updateCamera(t),t=ct.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,N),A=Xe.get(e,j.length),A.init(t),A.state.textureUnits=Be.getTextureUnits(),j.push(A),ke.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Ee.setFromProjectionMatrix(ke,Ge,t.reversedDepth),Oe=this.localClippingEnabled,De=Qe.init(this.clippingPlanes,Oe),O=Je.get(e,ne.length),O.init(),ne.push(O),ct.enabled===!0&&ct.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&bt(e,t,-1/0,M.sortObjects)}bt(e,t,0,M.sortObjects),O.finish(),ae!==null&&ae.updateLights(A.state.lightsArray),M.sortObjects===!0&&O.sort(xe,Se),Ne=ct.enabled===!1||ct.isPresenting===!1||ct.hasDepthSensing()===!1,Ne&&tt.addToRenderList(O,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),De===!0&&Qe.beginShadows();let i=A.state.shadowsArray;if($e.render(i,e,t),De===!0&&Qe.endShadows(),(r&&re.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(A.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];St(n,r,e,a)}Ne&&tt.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];xt(O,e,n,n.viewport)}}else r.length>0&&St(n,r,e,t),Ne&&tt.render(e),xt(O,e,t)}N!==null&&ue===0&&(Be.updateMultisampleRenderTarget(N),Be.updateRenderTargetMipmap(N)),r&&re.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),ot.resetDefaultState(),de=-1,fe=null,j.pop(),j.length>0?(A=j[j.length-1],Be.setTextureUnits(A.state.textureUnits),De===!0&&Qe.setGlobalState(M.clippingPlanes,A.state.camera)):A=null,ne.pop(),O=ne.length>0?ne[ne.length-1]:null,ae!==null&&ae.renderEnd()};function bt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)A.pushLightProbeGrid(e);else if(e.isLight)A.pushLight(e),e.castShadow&&A.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Ee)){r&&je.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ke);let i=We.update(e),a=e.material;a.visible&&O.push(e,i,a,n,je.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Ee))){let i=We.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),je.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),je.copy(e.boundingSphere.center)),je.applyMatrix4(e.matrixWorld).applyMatrix4(ke)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,je.z,s,t)}}else a.visible&&O.push(e,i,a,n,je.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)bt(i[e],t,n,r)}function xt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;A.setupLightsView(n),De===!0&&Qe.setGlobalState(M.clippingPlanes,n),r&&F.viewport(pe.copy(r)),i.length>0&&Ct(i,t,n),a.length>0&&Ct(a,t,n),o.length>0&&Ct(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function St(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[r.id]===void 0){let e=Ie.has(`EXT_color_buffer_half_float`)||Ie.has(`EXT_color_buffer_float`);A.state.transmissionRenderTarget[r.id]=new jt(1,1,{generateMipmaps:!0,type:e?g:l,minFilter:c,samples:Math.max(4,Le.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:vt.workingColorSpace})}let a=A.state.transmissionRenderTarget[r.id],o=r.viewport||pe;a.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let s=M.getRenderTarget(),u=M.getActiveCubeFace(),d=M.getActiveMipmapLevel();M.setRenderTarget(a),M.getClearColor(ge),_e=M.getClearAlpha(),_e<1&&M.setClearColor(16777215,.5),M.clear(),Ne&&tt.render(n);let f=M.toneMapping;M.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),A.setupLightsView(r),De===!0&&Qe.setGlobalState(M.clippingPlanes,r),Ct(e,n,r),Be.updateMultisampleRenderTarget(a),Be.updateRenderTargetMipmap(a),Ie.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,wt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Be.updateMultisampleRenderTarget(a),Be.updateRenderTargetMipmap(a))}M.setRenderTarget(s,u,d),M.setClearColor(ge,_e),p!==void 0&&(r.viewport=p),M.toneMapping=f}function Ct(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&wt(o,t,n,s,l,c)}}function wt(e,t,n,r,i,a){ae!==null&&i.isNodeMaterial&&ae.setObject(e,i),e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function Tt(e,t,n){t.isScene!==!0&&(t=Me);let r=I.get(e),i=A.state.lights,a=A.state.shadowsArray,o=i.state.version,s=Ke.getParameters(e,i.state,a,t,n,A.state.lightProbeGridArray),c=Ke.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ve.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,dt),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Dt(e,s),d}else s.uniforms=Ke.getUniforms(e),ae!==null&&e.isNodeMaterial&&ae.build(e,n,s),e.onBeforeCompile(s,M),d=Ke.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Qe.uniform),Dt(e,s),r.needsLights=Nt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=A.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function Et(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Is.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Dt(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Ot(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function At(e,t,n,r,i){t.isScene!==!0&&(t=Me),Be.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?M.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:vt.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ve.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=M.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=A.state.lights;if(De===!0&&(Oe===!0||e!==fe)){let t=e===fe&&r.id===de;Qe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Qe.numPlanes||v.numIntersection!==Qe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=A.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=Tt(r,t,i),ae&&r.isNodeMaterial&&ae.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(F.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==de&&(de=r.id,C=!0),v.needsLights){let e=Ot(A.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||fe!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(P,`projectionMatrix`,e.projectionMatrix),T.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(P,Ae.setFromMatrixPosition(e.matrixWorld)),Le.logarithmicDepthBuffer&&T.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),fe!==e&&(fe=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(P,`sunShadowMap`,y.state.sunShadowMap,Be),y.state.directionalShadowMap.length>0&&T.setValue(P,`directionalShadowMap`,y.state.directionalShadowMap,Be),y.state.spotShadowMap.length>0&&T.setValue(P,`spotShadowMap`,y.state.spotShadowMap,Be),y.state.pointShadowMap.length>0&&T.setValue(P,`pointShadowMap`,y.state.pointShadowMap,Be)),i.isSkinnedMesh){T.setOptional(P,i,`bindMatrix`),T.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(P,`boneTexture`,e.boneTexture,Be))}i.isBatchedMesh&&(T.setOptional(P,i,`batchingTexture`),T.setValue(P,`batchingTexture`,i._matricesTexture,Be),T.setOptional(P,i,`batchingIdTexture`),T.setValue(P,`batchingIdTexture`,i._indirectTexture,Be),T.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(P,`batchingColorTexture`,i._colorsTexture,Be));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&nt.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=rl()),C){if(T.setValue(P,`toneMappingExposure`,M.toneMappingExposure),v.needsLights&&Mt(E,w),a&&r.fog===!0&&qe.refreshFogUniforms(E,a),qe.refreshMaterialUniforms(E,r,be,ye,A.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}Is.upload(P,Et(v),E,Be)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Is.upload(P,Et(v),E,Be),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(P,`center`,i.center),T.setValue(P,`modelViewMatrix`,i.modelViewMatrix),T.setValue(P,`normalMatrix`,i.normalMatrix),T.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];z.update(n,x),z.bind(n,x)}}return x}function Mt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Nt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,F.viewport(pe),F.scissor(me),F.setScissorTest(he),de=-1;return}if(o.__webglFramebuffer===void 0)Be.setupRenderTarget(e);else if(o.__hasExternalTextures)Be.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);Be.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Be.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(pe),F.scissor(me),F.setScissorTest(he),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}de=-1};function Ft(e){let t=I.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Le.textureFormatReadable(e.format),t.__typeReadable=Le.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=Ft(o);if(u.__formatReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,at.convert(c),at.convert(l),a)}finally{let e=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=Ft(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,at.convert(l),at.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await et(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Be.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=at.convert(t.format),_=at.convert(t.type),v;t.isData3DTexture?(Be.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Be.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(Be.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,o,s,f,p,o,s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,se),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,o,s,f,p,o,s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&Be.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Be.setTextureCube(e,0):e.isData3DTexture?Be.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Be.setTexture2DArray(e,0):Be.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){le=0,ue=0,N=null,F.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ge}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=vt._getDrawingBufferColorSpace(e),t.unpackColorSpace=vt._getUnpackColorSpace()}},al=Math.PI/180,q={game:{title:`Stories of Kane`,bestWaveKey:`dust-and-lead.bestWave`},sim:{fixedDt:1/60,maxStepsPerFrame:5},render:{baseWidth:320,baseHeight:180,unitsPerPixel:1/11,pixelate:!0,outlines:!0,paletteQuantize:!0,subpixelCamera:!0,depthEdgeThreshold:.32,normalEdgeHighlight:.22,outlineDarken:.4,outlineColor:2825492,skyColor:10274524,shadowMapSize:2048,shadowExtent:26,sunDirection:[-.64,.59,.48],sunColor:16765594,sunIntensity:2.6,skyLightColor:11129066,groundLightColor:11565642,hemiIntensity:1.25},camera:{distance:80,near:1,far:220,followSharpness:7,aimLead:.18,maxAimLead:3.2},shake:{shotTrauma:.28,impactTrauma:.08,maxOffset:.32,decay:2.8},player:{radius:.35,walkSpeed:4.3,sprintSpeed:6.9,acceleration:38,deceleration:30,mountRange:2.6,maxHp:100,regenDelay:5,regenRate:8,respawnTime:3.5,autoHolsterTime:30,crouch:{speedMul:.5,spreadMul:.6,movingSpreadMul:.8,hitboxScale:.6,blendTime:.2,standHeight:1.85},crouchDrop:.35,standHeightCrouched:1.15,spreadMovingMul:2.75,spreadMountedMul:4.5,spreadMountedPerSpeed:.225},items:{ammoMaxStack:{revolverAmmo:50,rifleAmmo:20,shotgunShells:12},playerGrid:{w:8,h:4},npcGrid:{w:8,h:4},weaponSwapTime:.4},sandbox:{startingDollars:150},wave:{horseUnlockWave:3,mountedEnemiesFromWave:5,countdown:5,intermission:25,clearedBanner:3,spawnInterval:[1,2],corpseWaves:2,riderlessStay:10,minSpawnDistance:18,revive:{tokens:1,slowMo:.3,slowMoTime:1,getUpAfter:2,hp:.5,knockbackRadius:5,knockback:3,invulnerable:2},orbitRadius:9},projectiles:{tracerLength:1.6},npc:{radius:.35,hp:100,walkSpeed:1.5,combatSpeed:2.6,runSpeed:4.8,inaccuracy:2.5,reactionTime:.3,movingSpreadMul:1.6,talkRange:2.8,noticeRange:4.5,nearMissRadius:3,warnCooldown:2.5,witnessRange:12,awarenessRange:24,calmTime:60,hideBreakRange:8,respawnTime:45,eyeHeight:1.55,chestHeight:1.2,speechTime:3.2,talkTime:4,crouch:{strafeCoverChance:.6,holdTime:[5,9],maxTravel:10,popUpHold:.35,flinchChance:.6,flinchTime:[.5,.9],inspectTime:[2,3.5]}},horse:{tail:{segments:5,length:1,stiffness:70,followStiffness:120,damping:9,swishInterval:[2,6]},canterSpeed:7.5,gallopSpeed:12.5,acceleration:14,decay:13.2,brakeDecel:24,turnRateSlow:4.2,turnRateGallop:1.25,pivotSpeed:1.2,pivotTurnRate:3.4,brakeAngle:150*al,turnSpeedLoss:.32,pivotAlignAngle:20*al,stopEpsilon:.05,radius:.75,collisionSpeedLoss:1},targets:{bottleRespawn:3.5,dummyHp:5,dummyRespawn:4},world:{size:100,seed:1337}},ol=Math.PI*2;function sl(e,t,n){return e<t?t:e>n?n:e}function cl(e){return sl(e,0,1)}function ll(e,t,n){return e+(t-e)*n}function ul(e,t,n){let r=cl((n-e)/(t-e));return r*r*(3-2*r)}function dl(e){return e=(e+Math.PI)%ol,e<0&&(e+=ol),e-Math.PI}function fl(e,t){return dl(t-e)}function pl(e,t,n,r){return ll(e,t,1-Math.exp(-n*r))}function ml(e,t,n,r){return e+fl(e,t)*(1-Math.exp(-n*r))}function hl(e,t,n){return e+fl(e,t)*n}function gl(e,t,n){return Math.abs(t-e)<=n?t:e+Math.sign(t-e)*n}function _l(e){return Math.sin(e)}function vl(e){return Math.cos(e)}function yl(e,t){return Math.atan2(e,t)}var bl=class{s;constructor(e){this.s=e>>>0}next(){let e=this.s+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}range(e,t){return e+(t-e)*this.next()}int(e,t){return Math.floor(this.range(e,t))}pick(e){return e[Math.floor(this.next()*e.length)]}};function xl(e,t,n=0){let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=(e,t)=>{let r=e*374761393+t*668265263+n*2147483647;return r=(r^r>>>13)*1274126177,r^=r>>>16,(r>>>0)%1e4/1e4},c=a*a*(3-2*a),l=o*o*(3-2*o);return ll(ll(s(r,i),s(r+1,i),c),ll(s(r,i+1),s(r+1,i+1),c),l)}var Sl=class{camera;view;right=new V;up=new V;back=new V;screenRightGround=new V(1,0,-1).normalize();screenUpGround=new V(-1,0,-1).normalize();focus=new V;subpixel=new B;trauma=0;shakeTime=0;lowW=q.render.baseWidth;lowH=q.render.baseHeight;offset;constructor(){let e=q.camera;this.camera=new ba(-1,1,1,-1,e.near,e.far),this.view=new ba(-1,1,1,-1,e.near,e.far),this.offset=new V(1,1,1).normalize().multiplyScalar(e.distance);for(let e of[this.camera,this.view])e.position.copy(this.offset),e.lookAt(0,0,0),e.updateMatrixWorld();this.right.setFromMatrixColumn(this.camera.matrixWorld,0).normalize(),this.up.setFromMatrixColumn(this.camera.matrixWorld,1).normalize(),this.back.setFromMatrixColumn(this.camera.matrixWorld,2).normalize()}get pixelSize(){return q.render.unitsPerPixel}setViewport(e,t){this.lowW=e,this.lowH=t;let n=this.pixelSize,r=e/2*n,i=t/2*n;Object.assign(this.view,{left:-r,right:r,top:i,bottom:-i}),this.view.updateProjectionMatrix(),this.applyRenderFrustum(!0)}bordered=!0;applyRenderFrustum(e){this.bordered=e;let t=this.pixelSize,n=+!!e,r=(this.lowW/2+n)*t,i=(this.lowH/2+n)*t;Object.assign(this.camera,{left:-r,right:r,top:i,bottom:-i}),this.camera.updateProjectionMatrix()}addTrauma(e){this.trauma=Math.min(1,this.trauma+e)}snapTo(e){this.focus.copy(e)}tmp=new V;update(e,t,n){let r=q.camera.followSharpness;this.focus.x=pl(this.focus.x,t.x,r,e),this.focus.y=pl(this.focus.y,t.y,r,e),this.focus.z=pl(this.focus.z,t.z,r,e),this.trauma=Math.max(0,this.trauma-q.shake.decay*e),this.shakeTime+=e;let i=this.trauma*this.trauma*q.shake.maxOffset,a=i*Math.sin(this.shakeTime*71.3)*Math.cos(this.shakeTime*13.1),o=i*Math.sin(this.shakeTime*57.7+1.7),s=this.tmp.copy(this.focus).add(this.offset);if(s.addScaledVector(this.right,a).addScaledVector(this.up,o),this.view.position.copy(s),this.view.updateMatrixWorld(),n!==this.bordered&&this.applyRenderFrustum(n),n){let e=this.pixelSize,t=s.dot(this.right),n=s.dot(this.up),r=s.dot(this.back),i=Math.round(t/e)*e,a=Math.round(n/e)*e;this.camera.position.copy(this.right).multiplyScalar(i).addScaledVector(this.up,a).addScaledVector(this.back,r),this.subpixel.set(q.render.subpixelCamera?(t-i)/e:0,q.render.subpixelCamera?(n-a)/e:0)}else this.camera.position.copy(s),this.subpixel.set(0,0);this.camera.updateMatrixWorld()}ray=new xr;pickRay(e,t){let n=this.view;return this.ray.origin.copy(n.position).addScaledVector(this.right,e*n.right).addScaledVector(this.up,t*n.top),this.ray.direction.copy(this.back).negate(),this.ray}},Cl=class{down=new Set;pressed=new Set;mouseDown=!1;mouseX=window.innerWidth/2;mouseY=window.innerHeight/2;mouseInside=!0;constructor(e){window.addEventListener(`keydown`,e=>{(e.code===`Tab`||e.code===`Space`||e.code===`F3`)&&e.preventDefault(),e.repeat||this.pressed.add(e.code),this.down.add(e.code)}),window.addEventListener(`keyup`,e=>this.down.delete(e.code)),window.addEventListener(`blur`,()=>{this.down.clear(),this.mouseDown=!1}),e.addEventListener(`mousedown`,e=>{e.button===0?(this.mouseDown=!0,this.pressed.add(`Mouse0`)):e.button===2&&this.pressed.add(`Mouse2`)}),window.addEventListener(`mouseup`,e=>{e.button===0&&(this.mouseDown=!1,this.pressed.add(`Mouse0Up`))}),window.addEventListener(`mousemove`,e=>{this.mouseX=e.clientX,this.mouseY=e.clientY,this.mouseInside=!0}),document.addEventListener(`mouseleave`,()=>this.mouseInside=!1),e.addEventListener(`contextmenu`,e=>e.preventDefault())}isDown(e){return this.down.has(e)}clearPressed(){this.pressed.clear()}consume(e){return this.pressed.delete(e)}moveAxes(){return{x:+!!this.isDown(`KeyD`)-!!this.isDown(`KeyA`),y:+!!this.isDown(`KeyW`)-!!this.isDown(`KeyS`)}}get sprint(){return this.isDown(`ShiftLeft`)||this.isDown(`ShiftRight`)}},J={ink:2037008,outline:2825492,darkBrown:4139548,brown:5913124,wood:8015405,woodLight:10251070,woodPale:11895631,rust:9386783,rustLight:11884075,orange:13793855,sandDark:11109714,sand:13215339,sandLight:14466178,sandPale:15257499,cream:16051416,skyDeep:6263733,sky:9354454,skyPale:12902634,cactusDark:4085040,cactus:6126142,cactusLight:9084498,red:10697258,redDark:7218201,skin:14262394,skinDark:11038284,rockDark:6181448,rock:9075563,rockLight:11575432,metal:4867654,metalLight:8222322,brass:14263361,brassLight:16242548,glass:8369562,glassBrown:9067050,denim:4939642,white:16774876},wl=[J.ink,J.outline,J.darkBrown,J.brown,J.wood,J.woodLight,J.woodPale,J.rust,J.rustLight,J.orange,9333830,10124386,8743510,7494220,6179394,4864566,J.sandDark,J.sand,J.sandLight,J.sandPale,J.cream,J.skyDeep,J.sky,J.skyPale,3028032,J.cactusDark,J.cactus,J.cactusLight,J.red,J.redDark,J.skin,J.skinDark,3880242,J.rockDark,J.rock,J.rockLight,J.metal,J.metalLight,J.brass,J.brassLight,J.glass,3820126,J.denim,11772042,13350812,J.white,16771496],Tl=[{id:`cowboy_hat_brown`,name:`Brown Stetson`,description:`Sweat-stained and trail-worn.`,slot:`hat`,kind:`cowboyHat`,color:J.brown,trim:J.ink},{id:`cowboy_hat_tan`,name:`Tan Stetson`,description:`A light felt hat with a leather band.`,slot:`hat`,kind:`cowboyHat`,color:J.woodPale,trim:J.darkBrown},{id:`cowboy_hat_dark`,name:`Dark Stetson`,description:`Dark felt with a red band.`,slot:`hat`,kind:`cowboyHat`,color:J.darkBrown,trim:J.red},{id:`cowboy_hat_black`,name:`Black Stetson`,description:`Black felt, brass-studded band.`,slot:`hat`,kind:`cowboyHat`,color:J.ink,trim:J.brass},{id:`bonnet_cream`,name:`Bonnet`,description:`Keeps the sun off.`,slot:`hat`,kind:`bonnet`,color:J.cream,trim:J.skyDeep},{id:`shirt_cream`,name:`Cream Shirt`,description:`Plain cotton work shirt.`,slot:`top`,kind:`shirt`,color:J.cream},{id:`shirt_rust`,name:`Rust Shirt`,description:`Faded red flannel.`,slot:`top`,kind:`shirt`,color:J.rustLight},{id:`shirt_denim`,name:`Denim Shirt`,description:`Heavy blue work shirt.`,slot:`top`,kind:`shirt`,color:J.denim},{id:`shirt_grey`,name:`Grey Shirt`,description:`Faded charcoal cotton.`,slot:`top`,kind:`shirt`,color:3880242},{id:`poncho_rust`,name:`Poncho`,description:`Woven wool with a cream stripe.`,slot:`outerwear`,kind:`poncho`,color:J.rustLight,trim:J.cream},{id:`vest_brown`,name:`Leather Vest`,description:`Brown leather, open front.`,slot:`outerwear`,kind:`vest`,color:J.brown},{id:`duster_sand`,name:`Duster`,description:`Long canvas riding coat.`,slot:`outerwear`,kind:`duster`,color:J.sandDark},{id:`duster_dark`,name:`Dark Duster`,description:`Dust-stained, blood-stained. Outlaw issue.`,slot:`outerwear`,kind:`duster`,color:J.darkBrown},{id:`duster_black`,name:`Black Duster`,description:`Black oilcloth riding coat.`,slot:`outerwear`,kind:`duster`,color:J.ink},{id:`trousers_denim`,name:`Denim Trousers`,description:`Riveted work trousers.`,slot:`legs`,kind:`trousers`,color:J.denim},{id:`trousers_brown`,name:`Brown Trousers`,description:`Wool trousers.`,slot:`legs`,kind:`trousers`,color:J.brown},{id:`chaps_wood`,name:`Chaps`,description:`Fringed leather chaps over canvas trousers.`,slot:`legs`,kind:`chaps`,color:J.wood,trim:J.sandDark},{id:`chaps_dark`,name:`Dark Chaps`,description:`Black leather chaps over dark trousers.`,slot:`legs`,kind:`chaps`,color:J.darkBrown,trim:3880242},{id:`dress_blue`,name:`Blue Dress`,description:`Long prairie dress with cream trim.`,slot:`fullBody`,kind:`dress`,color:J.skyDeep,trim:J.cream},{id:`dress_red`,name:`Red Dress`,description:`Burgundy town dress with lace cuffs.`,slot:`fullBody`,kind:`dress`,color:J.redDark,trim:J.cream},{id:`bandana_red`,name:`Red Bandana`,description:`Keeps the dust out.`,slot:`neck`,kind:`bandana`,color:J.red},{id:`bandana_black`,name:`Black Bandana`,description:`Favoured by men with a price on their head.`,slot:`neck`,kind:`bandana`,color:J.ink},{id:`bandana_rust`,name:`Rust Bandana`,description:`Sun-bleached red.`,slot:`neck`,kind:`bandana`,color:J.rust},{id:`boots_brown`,name:`Brown Boots`,description:`Riding boots.`,slot:`boots`,kind:`boots`,color:J.darkBrown},{id:`boots_black`,name:`Black Boots`,description:`Polished, mostly.`,slot:`boots`,kind:`boots`,color:J.ink},{id:`belt_leather`,name:`Leather Belt`,description:`Brass buckle.`,slot:`belt`,kind:`belt`,color:J.darkBrown,trim:J.brass},{id:`holster_leather`,name:`Holster`,description:`Hip holster for a revolver.`,slot:`holster`,kind:`holster`,color:J.brown}],El=Object.fromEntries(Tl.map(e=>[e.id,e]));function Dl(e){let t=El[e];if(!t)throw Error(`Unknown clothing "${e}"`);return t}var Ol=q.items.ammoMaxStack,kl={hat:{w:2,h:2},top:{w:2,h:3},outerwear:{w:2,h:3},legs:{w:2,h:3},fullBody:{w:2,h:4},boots:{w:2,h:2},neck:{w:1,h:1},belt:{w:2,h:1},holster:{w:1,h:2}},Al=[{id:`revolver`,name:`Revolver`,description:`Six-shot single action. Reliable at medium range.`,category:`weapon`,size:{w:2,h:2},stackable:!1,maxStack:1,weaponDefId:`revolver`},{id:`rifle`,name:`Rifle`,description:`Lever-action rifle. Slow, but true at long range.`,category:`weapon`,size:{w:4,h:1},stackable:!1,maxStack:1,weaponDefId:`rifle`},{id:`shotgun`,name:`Shotgun`,description:`Double-barrelled scattergun. Devastating up close.`,category:`weapon`,size:{w:4,h:2},stackable:!1,maxStack:1,weaponDefId:`shotgun`},{id:`ammo_revolver`,name:`Revolver Rounds`,description:`A box of .44 cartridges.`,category:`ammo`,size:{w:1,h:1},stackable:!0,maxStack:Ol.revolverAmmo,ammoType:`revolverAmmo`,boxQuantity:18,icon:{tint:J.red}},{id:`ammo_rifle`,name:`Rifle Rounds`,description:`A box of long rifle cartridges.`,category:`ammo`,size:{w:1,h:1},stackable:!0,maxStack:Ol.rifleAmmo,ammoType:`rifleAmmo`,boxQuantity:10,icon:{tint:J.cactus}},{id:`ammo_shells`,name:`Shotgun Shells`,description:`A box of buckshot shells.`,category:`ammo`,size:{w:1,h:1},stackable:!0,maxStack:Ol.shotgunShells,ammoType:`shotgunShells`,boxQuantity:6,icon:{tint:J.skyDeep}},{id:`bandage`,name:`Bandage`,description:`Clean linen. Right-click or G to use: heals 40% over 2s.`,category:`consumable`,size:{w:1,h:1},stackable:!0,maxStack:5,heal:{fraction:.4,duration:2},icon:{tint:J.red}},...Object.values(El).map(e=>({id:e.id,name:e.name,description:e.description,category:`clothing`,size:kl[e.slot],stackable:!1,maxStack:1,clothingId:e.id}))],jl=Object.fromEntries(Al.map(e=>[e.id,e])),Ml=[J.ink>>16&255,J.ink>>8&255,J.ink&255];function Nl(e,t,n,r){(r.width!==t||r.height!==n)&&(r.width=t,r.height=n);let i=r.getContext(`2d`),a=i.createImageData(t,n),o=(r,i)=>r<0||i<0||r>=t||i>=n?0:e[((n-1-i)*t+r)*4+3];for(let r=0;r<n;r++)for(let i=0;i<t;i++){let s=(r*t+i)*4,c=((n-1-r)*t+i)*4;e[c+3]>127?(a.data[s]=e[c],a.data[s+1]=e[c+1],a.data[s+2]=e[c+2],a.data[s+3]=255):(o(i-1,r)>127||o(i+1,r)>127||o(i,r-1)>127||o(i,r+1)>127)&&a.data.set([...Ml,255],s)}i.putImageData(a,0,0)}var Pl=Math.PI/180,Fl={revolver:{id:`revolver`,name:`Revolver`,damage:25,fireInterval:.3,magazine:6,reloadTime:1.5,spread:.8*Pl,spreadGrowth:.1,range:46,bulletSpeed:72,pellets:1,falloffStart:46,falloffMin:1,carry:`holster`,ammoType:`revolverAmmo`,drawTime:.45,ai:{preferredRange:[5,11],extraDelay:[.5,1.1],telegraph:.5},look:{kind:`pistol`,barrelLength:.32,barrels:1,metal:J.metalLight,wood:J.woodLight}},rifle:{id:`rifle`,ammoType:`rifleAmmo`,name:`Rifle`,damage:45,fireInterval:1.3,magazine:5,reloadTime:2.6,spread:.25*Pl,spreadGrowth:.05,range:70,bulletSpeed:110,pellets:1,falloffStart:70,falloffMin:1,carry:`back`,drawTime:.8,ai:{preferredRange:[13,22],extraDelay:[.6,1.4],telegraph:.7},look:{kind:`longgun`,barrelLength:.95,barrels:1,metal:J.metal,wood:J.wood}},shotgun:{id:`shotgun`,ammoType:`shotgunShells`,name:`Shotgun`,damage:12,fireInterval:.9,magazine:2,reloadTime:2.4,spread:6*Pl,spreadGrowth:0,range:16,bulletSpeed:60,pellets:[6,8],falloffStart:4,falloffMin:.25,carry:`back`,drawTime:.7,ai:{preferredRange:[2.5,6],extraDelay:[.4,.9],telegraph:.5},look:{kind:`longgun`,barrelLength:.7,barrels:2,metal:J.metal,wood:J.woodLight}}};function Il(e){if(e===null)return null;if(typeof e!=`string`)return e;let t=Fl[e];if(!t)throw Error(`Unknown weapon "${e}"`);return t}var Ll={},Rl={};function zl(e){let t=jl[e]??Ll[e];if(!t)throw Error(`Unknown item "${e}"`);return t}function Bl(e){return e.weaponDefId?Fl[e.weaponDefId]??Rl[e.weaponDefId]??null:null}function Vl(e){return e.clothingId?El[e.clothingId]??null:null}function Hl(e){let t=Object.values(jl).find(t=>t.weaponDefId===e.id)??Ll[`weapon:${e.id}`];if(t)return t;let n=e.look.kind===`pistol`,r={id:`weapon:${e.id}`,name:e.name,description:n?`A sidearm.`:`A long gun.`,category:`weapon`,size:n?{w:2,h:2}:{w:4,h:e.look.barrels>1?2:1},stackable:!1,maxStack:1,weaponDefId:e.id};return Ll[r.id]=r,Rl[e.id]=e,r}function Ul(e){return Object.values(jl).find(t=>t.category===`ammo`&&t.ammoType===e)??null}var Wl=null;function Gl(){return Wl||(Wl=new Lr(new Uint8Array([0,0,150,255]),4,1,D),Wl.minFilter=r,Wl.magFilter=r,Wl.generateMipmaps=!1,Wl.needsUpdate=!0,Wl.userData.shared=!0),Wl}var Kl=new Map;function ql(e){let t=Kl.get(e);return t||(t=new Fi({color:e,gradientMap:Gl()}),t.flatShading=!0,t.userData.shared=!0,Kl.set(e,t)),t}function Jl(){let e=new Fi({vertexColors:!0,gradientMap:Gl()});return e.flatShading=!0,e}function Y(e,t,n=0,r=0,i=0,a){let o=new Pr(e,ql(t));return o.position.set(n,r,i),o.castShadow=!0,o.receiveShadow=!0,a?.add(o),o}function X(e,t,n,r=0){let i=new mi(e,t,n);return r!==0&&i.translate(0,-r*t/2,0),i}function Yl(){let e=Jl(),t={value:0};return e.userData.uFade=t,e.onBeforeCompile=e=>{e.uniforms.uFade=t,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float uFade;
float bayer4(ivec2 p) {
  int i = (p.x & 3) + (p.y & 3) * 4;
  int m[16] = int[](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[i]) + 0.5) / 16.0;
}`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if (uFade > 0.0 && bayer4(ivec2(gl_FragCoord.xy)) < uFade) discard;`)},e.customProgramCacheKey=()=>`fadeable-toon`,e}function Xl(e){let t=new U,n=e.barrelLength;if(e.kind===`pistol`){Y(X(.07,.09,.17),e.wood,0,.02,-.07,t),Y(X(.08,.1,.1),e.metal,0,-.03,.02,t);for(let r=0;r<e.barrels;r++)Y(X(.05,n,.05,1),e.metal,(r-(e.barrels-1)/2)*.05,-.06,.05,t);return t}let r=Y(X(.08,.4,.12,-1),e.wood,0,.04,-.02,t);r.rotation.x=.22,Y(X(.09,.2,.1),e.metal,0,-.04,.03,t),Y(X(.08,n*.5,.08,1),e.wood,0,-.14,.02,t);for(let r=0;r<e.barrels;r++)Y(X(.045,n,.045,1),e.metal,(r-(e.barrels-1)/2)*.05,-.14,.07,t);return t}function Zl(e){return e.kind===`pistol`?.06+e.barrelLength:.14+e.barrelLength}var Ql=2.44,$l={male:{thigh:.43,shin:.37,foot:.08},female:{thigh:.44,shin:.36,foot:.08}};function eu(e,t,n){if(e.mounted)return{hip:-.5,knee:1,ankle:-.5,roll:n*.42};let r=e.stride*(1-.45*e.crouch),i=e.run,a=Math.max(0,Math.cos(t)),o=Math.max(0,-Math.cos(t)),s=Math.sin(t)*ll(.42,.72,i)*r,c=a**1.5*ll(.95,1.7,i)*r+o*ll(.1,.32,i)*r,l=1-Math.min(1,e.stride*3);c+=l*.07*(1+n*Math.sin(e.time*.9)),s+=1.15*e.crouch,c+=1.9*e.crouch,s+=.7*e.buckle,c+=1.3*e.buckle;let u=0;e.crossed&&(n>0?(s-=.12,u=-.22):s+=.06);let d=-s;c=sl(c,0,Ql);let f=-(d+c)+.3*a*r;return{hip:d,knee:c,ankle:f,roll:u}}function tu(e){return[eu(e,e.phase,-1),eu(e,e.phase+Math.PI,1)]}function nu(e,t){return(t.thigh*Math.cos(e.hip)+t.shin*Math.cos(e.hip+e.knee))*Math.cos(e.roll)+t.foot}function ru(e,t){return t.thigh*Math.sin(-e.hip)-t.shin*Math.sin(e.hip+e.knee)+.05}var iu=.62,au=e=>[{thigh:e.legL,shin:e.kneeL,foot:e.ankleL,side:-1},{thigh:e.legR,shin:e.kneeR,foot:e.ankleR,side:1}];function ou(e,t,n,r,i){let{thigh:a,shin:o}=n.leg;for(let n of au(t))e(X(.176+i,a+.005,.196+i,1),r,0,.005,0,n.thigh),e(new Ci(.098+i/2,8,6),r,0,0,0,n.shin),e(X(.166+i,o,.184+i,1),r,0,0,0,n.shin)}var su=e=>[e.armL,e.armR],cu={cowboyHat:(e,t,n,r)=>{e(new gi(.36,.36,.04,10),r.color,0,.27,0,t.head),e(new gi(.15,.19,.22,8),r.color,0,.39,0,t.head),e(new gi(.195,.195,.05,8),r.trim??J.ink,0,.31,0,t.head)},bonnet:(e,t,n,r)=>{e(X(.3,.3,.28),r.color,0,.16,-.04,t.head),e(X(.36,.07,.07),r.color,0,.31,.11,t.head);for(let n of[-1,1])e(X(.06,.3,.07),r.color,n*.17,.15,.1,t.head);e(X(.26,.03,.03),r.trim??r.color,0,0,.11,t.head)},shirt:(e,t,n,r)=>{e(X(n.w+.012,.462,.252,-1),r.color,0,.06,0,t.upper);for(let n of su(t))e(X(.124,.44,.124,1),r.color,0,.005,0,n)},vest:(e,t,n,r)=>{let i=n.w;e(X(i+.04,.36,.04,-1),r.color,0,.16,-.12,t.upper);for(let n of[-1,1])e(X(i/2-.03,.36,.04,-1),r.color,n*(i/4+.025),.16,.12,t.upper),e(X(.04,.36,.26,-1),r.color,n*(i/2+.01),.16,0,t.upper)},duster:(e,t,n,r)=>{let i=n.w;e(X(i+.06,.48,.04,-1),r.color,0,.06,-.13,t.upper);for(let n of[-1,1])e(X(i/2-.02,.48,.04,-1),r.color,n*(i/4+.03),.06,.13,t.upper),e(X(.04,.48,.28,-1),r.color,n*(i/2+.02),.06,0,t.upper);e(X(i+.1,.08,.3),r.color,0,.56,-.01,t.upper),e(X(i+.08,.16,.3),r.color,0,0,0,t.hips);for(let i of au(t)){let t=n.leg.thigh+.08;e(X(.24,t,.04,1),r.color,i.side*.02,.06,.13,i.thigh),e(X(.26,t,.04,1),r.color,i.side*.02,.06,-.13,i.thigh),e(X(.04,t,.27,1),r.color,i.side*.13,.06,0,i.thigh)}for(let n of su(t))e(X(.134,.45,.134,1),r.color,0,.01,0,n)},poncho:(e,t,n,r)=>{let i=e(new _i(.46,.5,4,1),r.color,0,.42,0,t.upper);i.rotation.y=Math.PI/4,i.scale.set(1,1,.75);let a=e(new _i(.47,.1,4,1,!0),r.trim??J.cream,0,.27,0,t.upper);a.rotation.y=Math.PI/4,a.scale.set(1,1,.76)},trousers:(e,t,n,r)=>{ou(e,t,n,r.color,.006),e(X(n.w+.02,.12,.24),r.color,0,.02,0,t.hips)},chaps:(e,t,n,r)=>{let i=r.trim??J.sandDark;ou(e,t,n,i,.006);let{thigh:a,shin:o}=n.leg;for(let n of au(t))e(X(.204,a-.03,.224,1),r.color,0,-.02,0,n.thigh),e(new Ci(.112,8,6),r.color,0,0,0,n.shin),e(X(.194,o-.07,.212,1),r.color,0,0,0,n.shin),e(X(.04,a-.1,.2,1),J.sandLight,n.side*.115,-.06,0,n.thigh),e(X(.04,o-.12,.19,1),J.sandLight,n.side*.11,-.02,0,n.shin);e(X(n.w+.02,.12,.24),i,0,.02,0,t.hips)},dress:(e,t,n,r)=>{let i=e(new gi(n.w/2+.02,.36,.78,8),r.color,0,-.36,0,t.hips);r.trim!==void 0&&e(new gi(.37,.37,.06,8),r.trim,0,-.38,0,i),e(X(n.w+.02,.12,.24),r.color,0,.02,0,t.hips),e(X(n.w+.012,.462,.252,-1),r.color,0,.06,0,t.upper);for(let n of su(t))e(X(.124,.44,.124,1),r.trim??r.color,0,.005,0,n);return i},bandana:(e,t,n,r)=>{e(X(.26,.08,.26),r.color,0,.6,0,t.upper),e(X(.14,.1,.04),r.color,0,.52,.13,t.upper)},boots:(e,t,n,r)=>{let{shin:i,foot:a}=n.leg;for(let n of au(t))e(X(.192,.25,.214,1),r.color,0,-(i-.25),.005,n.shin),e(X(.2,a+.01,.3,1),r.color,0,.01,.04,n.foot),e(X(.21,.03,.31,1),J.ink,0,-a+.03,.04,n.foot)},belt:(e,t,n,r)=>{e(X(n.w+.04,.1,.26),r.color,0,0,0,t.hips),e(X(.09,.07,.04),r.trim??J.brass,0,0,.135,t.hips)},holster:(e,t,n,r)=>{e(X(.1,.22,.16,1),r.color,n.w/2+.04,-.02,0,t.hips)}},lu=class{bodyless;root=new U;body=new U;hips=new U;upper=new U;head=new U;legL=new U;legR=new U;kneeL=new U;kneeR=new U;ankleL=new U;ankleR=new U;armL=new U;armR=new U;anchors={hand:new U,hipR:new U,hipL:new U,back1:new U,back2:new U};skirt=null;fit={w:.4,female:!1,leg:$l.male};appearance=null;layer=[];weapons=[];weaponDefs=[];constructor(e,t=!1){this.bodyless=t,this.root.add(this.body),this.body.add(this.hips,this.upper),this.hips.position.y=.88,this.upper.position.y=.88,this.upper.rotation.order=`YXZ`,this.head.position.y=.66,this.upper.add(this.head),this.hips.add(this.legL,this.legR),this.legL.add(this.kneeL),this.legR.add(this.kneeR),this.kneeL.add(this.ankleL),this.kneeR.add(this.ankleR),this.upper.add(this.armL,this.armR),this.anchors.hand.position.set(0,-.52,0),this.armR.add(this.anchors.hand),this.hips.add(this.anchors.hipR,this.anchors.hipL),this.anchors.back1.position.set(0,.28,-.17),this.anchors.back1.rotation.z=Math.PI-.65,this.anchors.back2.position.set(0,.28,-.21),this.anchors.back2.rotation.z=-(Math.PI-.65),this.upper.add(this.anchors.back1,this.anchors.back2),e&&this.applyAppearance(e)}applyAppearance(e){for(let e of this.layer)e.removeFromParent(),e.geometry.dispose();this.layer=[],this.skirt=null,this.appearance=e;let t=e.body===`female`,n=t?.34:.4,r=t?$l.female:$l.male;this.fit={w:n,female:t,leg:r},this.legL.position.set(-(t?.1:.12),0,0),this.legR.position.set(t?.1:.12,0,0);for(let e of[this.kneeL,this.kneeR])e.position.y=-r.thigh;for(let e of[this.ankleL,this.ankleR])e.position.y=-r.shin;this.armL.position.set(-(n/2+.05),.5,0),this.armR.position.set(n/2+.05,.5,0),this.anchors.hipR.position.set(n/2+.04,.08,0),this.anchors.hipL.position.set(-(n/2+.04),.08,0);let i=(e,t,n,r,i,a)=>{let o=Y(e,t,n,r,i,a);return this.layer.push(o),o};this.bodyless||this.buildBody(i,e);for(let t of Object.values(e.clothing))t&&this.buildPiece(i,Dl(t))}buildPiece(e,t){let n=cu[t.kind](e,this,this.fit,t);n&&(this.skirt=n)}buildBody(e,t){let n=this.fit.w;e(X(n,.46,.24,-1),t.skin,0,.06,0,this.upper);for(let n of[this.armL,this.armR])e(X(.11,.48,.11,1),t.skin,0,0,0,n),e(X(.12,.1,.12,1),t.skin,0,-.46,0,n);let{thigh:r,shin:i,foot:a}=this.fit.leg;for(let n of au(this))e(X(.17,r,.19,1),J.sandPale,0,0,0,n.thigh),e(new Ci(.09,8,6),J.sandPale,0,0,0,n.shin),e(X(.155,i,.17,1),J.sandPale,0,0,0,n.shin),e(X(.15,a,.24,1),t.skin,0,0,.03,n.foot);let o=this.head;e(X(.24,.26,.24,-1),t.skin,0,0,0,o);for(let t of[-1,1])e(X(.04,.04,.01),J.ink,t*.06,.15,.125,o);if(t.beard!==void 0&&e(X(.26,.07,.06),t.beard,0,.04,.11,o),e(X(.26,.07,.26),t.hair,0,.245,-.005,o),e(X(.26,.16,.05),t.hair,0,.17,-.115,o),t.hairStyle===`long`){e(X(.28,.46,.07,1),t.hair,0,.27,-.12,o);for(let n of[-1,1])e(X(.04,.24,.12),t.hair,n*.13,.12,-.04,o)}else t.hairStyle===`bun`&&e(X(.13,.13,.11),t.hair,0,.2,-.17,o)}poseLegs(e,t,n=20){let r=[[this.legL,this.kneeL,this.ankleL],[this.legR,this.kneeR,this.ankleR]],i=0,a=0;return r.forEach(([r,o,s],c)=>{let l=e[c];r.rotation.x=pl(r.rotation.x,l.hip,n,t),r.rotation.z=pl(r.rotation.z,l.roll,n,t),o.rotation.x=sl(pl(o.rotation.x,l.knee,n,t),0,Ql),s.rotation.x=pl(s.rotation.x,l.ankle,n,t);let u={hip:r.rotation.x,knee:o.rotation.x,ankle:0,roll:r.rotation.z};i=Math.max(i,nu(u,this.fit.leg)),a+=ru(u,this.fit.leg)/2}),this.feetForward=a,i}feetForward=0;placePelvis(e,t){let n=this.feetForward*t,r=this.hips.rotation.y;for(let t of[this.hips,this.upper])t.position.set(-Math.sin(r)*n,e,-Math.cos(r)*n)}poseSkirt(e,t){let n=this.skirt;if(!n)return;let r=1-.42*e;n.scale.set(1+.45*e,r,1+.75*e),n.position.set(0,.03-.39*r,.06*e),n.rotation.x=t*.12}get hasHolster(){return!!this.appearance?.clothing.holster}setWeapons(e){if(!(e.length===this.weaponDefs.length&&e.every((e,t)=>e===this.weaponDefs[t]))){for(let e of this.weapons)e?.removeFromParent();this.weaponDefs=[...e],this.weapons=e.map(e=>e?Xl(e.look):null)}}placeWeapons(e,t,n=!1){let r=0,i=0;this.weapons.forEach((a,o)=>{let s=this.weaponDefs[o];if(!a||!s)return;let c=s.look.kind===`pistol`,l;l=o===e&&(t||c&&n&&!this.hasHolster)?`hand`:c?r++===0?`hipR`:`hipL`:i++===0?`back1`:`back2`;let u=this.anchors[l];a.parent!==u&&(u.add(a),a.position.set(0,0,0),a.rotation.set(0,0,0))})}weaponMesh(e){return this.weapons[e]??null}};function uu(e){let t=new U,n=Bl(e);if(n){let e=new U;e.rotation.y=Math.PI/2;let r=Xl(n.look);return r.rotation.x=-Math.PI/2,e.add(r),t.add(e),t}let r=Vl(e);if(r){let e=new lu(void 0,!0);return e.applyAppearance({body:`male`,skin:0,hair:0,hairStyle:`short`,clothing:{}}),e.buildPiece((e,t,n,r,i,a)=>Y(e,t,n,r,i,a),r),t.add(e.root),t}if(e.category===`consumable`){Y(new gi(.2,.2,.22,10),J.cream,0,.2,0,t).rotation.z=Math.PI/2;let n=e.icon?.tint??J.red;return Y(X(.05,.18,.03),n,0,.2,.2,t),Y(X(.18,.05,.03),n,0,.2,.2,t),t}let i=e.icon?.tint??J.red;Y(X(.5,.28,.34,-1),J.sandLight,0,0,0,t),Y(X(.51,.1,.35,-1),i,0,.09,0,t);for(let e=0;e<3;e++)Y(new gi(.035,.035,.14,6),J.brass,-.12+e*.12,.33,.02,t),Y(new gi(.03,.035,.04,6),J.brassLight,-.12+e*.12,.42,.02,t);return t}var du=class{renderer;cache=new Map;scene=new gn;camera=new ba(-1,1,1,-1,.01,50);constructor(e){this.renderer=e;let t=q.render;this.scene.add(new aa(t.skyLightColor,t.groundLightColor,t.hemiIntensity*1.1));let n=new Sa(t.sunColor,t.sunIntensity);n.position.set(1.5,3,4),this.scene.add(n)}warm(e){for(let t of Object.keys(jl))for(let n of e)this.get(t,n)}get(e,t){let n=`${e}@${t}`,r=this.cache.get(n);return r||(r=this.render(e,t),this.cache.set(n,r)),r}render(e,t){let n=zl(e),i=n.size.w*t,a=n.size.h*t,o=uu(n);this.scene.add(o);let s=n.category===`weapon`?new V(.1,.35,1):new V(.45,.55,1);n.icon?.yaw&&s.applyAxisAngle(cn.DEFAULT_UP,n.icon.yaw),o.updateMatrixWorld(!0);let c=new jn().setFromObject(o),l=c.getCenter(new V),u=this.camera;u.position.copy(l).addScaledVector(s.normalize(),10),u.up.set(0,1,0),u.lookAt(l),u.updateMatrixWorld(!0);let d=u.matrixWorldInverse,f=1/0,p=-1/0,m=1/0,h=-1/0;for(let e=0;e<8;e++){let t=new V(e&1?c.max.x:c.min.x,e&2?c.max.y:c.min.y,e&4?c.max.z:c.min.z).applyMatrix4(d);f=Math.min(f,t.x),p=Math.max(p,t.x),m=Math.min(m,t.y),h=Math.max(h,t.y)}let g=1+2.5/Math.min(i,a),_=(p-f)/2*g,v=(h-m)/2*g;_/v>i/a?v=a/i*_:_=i/a*v;let y=(f+p)/2,b=(m+h)/2;Object.assign(u,{left:y-_,right:y+_,top:b+v,bottom:b-v}),u.updateProjectionMatrix();let x=new jt(i,a,{minFilter:r,magFilter:r});x.texture.colorSpace=ze;let S=this.renderer,C=S.getRenderTarget(),w=S.getClearColor(new W),T=S.getClearAlpha(),E=S.shadowMap.enabled;S.shadowMap.enabled=!1,S.setRenderTarget(x),S.setClearColor(0,0),S.clear(),S.render(this.scene,u);let D=new Uint8Array(i*a*4);S.readRenderTargetPixels(x,0,0,i,a,D),S.setRenderTarget(C),S.setClearColor(w,T),S.shadowMap.enabled=E,x.dispose(),this.scene.remove(o);let ee=document.createElement(`canvas`);return Nl(D,i,a,ee),ee}},fu=`
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,pu=`
precision highp float;

uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 uLowSize;      // low-res target size incl. border
uniform float uScale;       // integer upscale factor
uniform vec2 uOffset;       // sub-pixel camera remainder (low-res px)
uniform float uBorder;
uniform float uDepthRange;  // far - near
uniform float uPixelSize;   // world units per low-res pixel
uniform float uDepthThreshold;
uniform float uNormalHighlight;
uniform float uOutlineDarken;
uniform vec3 uOutlineColor; // sRGB
uniform bool uOutlines;
uniform bool uQuantize;
uniform vec3 uPalette[PALETTE_SIZE];

float depthAt(ivec2 p) { return texelFetch(tDepth, p, 0).r * uDepthRange; }
vec3 normalAt(ivec2 p) { return texelFetch(tNormal, p, 0).rgb * 2.0 - 1.0; }

vec3 toSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 quantize(vec3 c) {
  float best = 1e9;
  vec3 res = c;
  for (int i = 0; i < PALETTE_SIZE; i++) {
    vec3 p = uPalette[i];
    vec3 d = c - p;
    float rm = (c.r + p.r) * 0.5;
    float dist = (2.0 + rm) * d.r * d.r + 4.0 * d.g * d.g + (3.0 - rm) * d.b * d.b;
    if (dist < best) { best = dist; res = p; }
  }
  return res;
}

void main() {
  vec2 p = gl_FragCoord.xy / uScale + uBorder + uOffset;
  ivec2 maxP = ivec2(uLowSize) - 1;
  ivec2 ip = clamp(ivec2(floor(p)), ivec2(0), maxP);
  vec3 col = toSRGB(texelFetch(tColor, ip, 0).rgb);

  if (uOutlines) {
    float d = depthAt(ip);
    vec3 n = normalAt(ip);
    vec3 pc = vec3(vec2(ip) * uPixelSize, -d);
    float depthEdge = 0.0;
    float normalEdge = 0.0;
    ivec2 offs[4] = ivec2[](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));
    for (int i = 0; i < 4; i++) {
      ivec2 q = clamp(ip + offs[i], ivec2(0), maxP);
      float dq = depthAt(q);
      float diff = dq - d; // > 0 when the neighbour is farther away
      depthEdge = max(depthEdge, diff);
      vec3 nq = normalAt(q);
      // Convex crease: the neighbour's surface point lies behind this pixel's tangent plane.
      vec3 pq = vec3(vec2(q) * uPixelSize, -dq);
      float convex = step(dot(n, pq - pc), -0.004);
      normalEdge = max(normalEdge, (1.0 - dot(n, nq)) * convex);
    }
    if (depthEdge > uDepthThreshold) {
      col = mix(col * uOutlineDarken, uOutlineColor, 0.45);
    } else if (normalEdge > 0.15) {
      col = col * (1.0 + uNormalHighlight);
    }
  }

  if (uQuantize) col = quantize(col);
  gl_FragColor = vec4(col, 1.0);
}
`,mu=class{colorRT;normalRT;normalMat=new Ii;quadScene=new gn;quadCam=new ba(-1,1,1,-1,0,1);material;clearColor=new W;normalPassExclude=[];unoutlined=[];constructor(){let e={minFilter:r,magFilter:r,generateMipmaps:!1,depthBuffer:!0};this.colorRT=new jt(1,1,{...e,type:g}),this.normalRT=new jt(1,1,e),this.normalRT.depthTexture=new di(1,1),this.normalRT.depthTexture.type=m,this.normalMat.flatShading=!0;let t=q.render;this.material=new Ni({vertexShader:fu,fragmentShader:pu,defines:{PALETTE_SIZE:wl.length},uniforms:{tColor:{value:this.colorRT.texture},tNormal:{value:this.normalRT.texture},tDepth:{value:this.normalRT.depthTexture},uLowSize:{value:new B(1,1)},uScale:{value:1},uOffset:{value:new B},uBorder:{value:1},uDepthRange:{value:q.camera.far-q.camera.near},uDepthThreshold:{value:t.depthEdgeThreshold},uPixelSize:{value:t.unitsPerPixel},uNormalHighlight:{value:t.normalEdgeHighlight},uOutlineDarken:{value:t.outlineDarken},uOutlineColor:{value:hu(t.outlineColor)},uOutlines:{value:t.outlines},uQuantize:{value:t.paletteQuantize},uPalette:{value:wl.map(hu)}},depthTest:!1,depthWrite:!1});let n=new Pr(new Si(2,2),this.material);n.frustumCulled=!1,this.quadScene.add(n)}setSize(e,t,n){let r=e+2,i=t+2;this.colorRT.setSize(r,i),this.normalRT.setSize(r,i),this.material.uniforms.uLowSize.value.set(r,i),this.material.uniforms.uScale.value=n}set outlines(e){this.material.uniforms.uOutlines.value=e}get outlines(){return this.material.uniforms.uOutlines.value}set quantize(e){this.material.uniforms.uQuantize.value=e}get quantize(){return this.material.uniforms.uQuantize.value}render(e,t,n,r){e.shadowMap.needsUpdate=!0,e.setRenderTarget(this.colorRT),e.render(t,n);let i=t.background;e.getClearColor(this.clearColor);let a=e.getClearAlpha();t.background=null,t.overrideMaterial=this.normalMat;let o=[...this.unoutlined,...this.normalPassExclude].filter(e=>e.visible);for(let e of o)e.visible=!1;e.setClearColor(8421631,1),e.setRenderTarget(this.normalRT),e.render(t,n);for(let e of o)e.visible=!0;t.overrideMaterial=null,t.background=i,e.setClearColor(this.clearColor,a),this.material.uniforms.uOffset.value.copy(r),e.setRenderTarget(null),e.render(this.quadScene,this.quadCam)}};function hu(e){return new V((e>>16&255)/255,(e>>8&255)/255,(e&255)/255)}var gu=class{canvas=document.createElement(`canvas`);ctx;visible=!1;fps=60;v=new V;constructor(e){this.canvas.style.pointerEvents=`none`,this.canvas.style.imageRendering=`auto`,e.appendChild(this.canvas),this.ctx=this.canvas.getContext(`2d`)}setSize(e,t,n,r,i,a){this.canvas.width=e,this.canvas.height=t,Object.assign(this.canvas.style,{width:`${n}px`,height:`${r}px`,left:i,top:a})}project(e,t,n,r){return this.v.set(t,n,r).project(e),[(this.v.x+1)/2*this.canvas.width,(1-this.v.y)/2*this.canvas.height]}draw(e,t,n,r){e>0&&(this.fps+=(1/e-this.fps)*.05);let i=this.ctx;if(i.clearRect(0,0,this.canvas.width,this.canvas.height),!this.visible)return;let a=Math.max(1,this.canvas.height/540),o=[`FPS ${this.fps.toFixed(0)}`,...r,`red = heading, blue = input, yellow = turn radius`];if(!n){this.label(o,10*a,10*a,a);return}let s=n.motor,c=n.model.root.position,l=Math.abs(s.angularVelocity)>.001,u=l?s.currentTurnRadius():s.minTurnRadius();if(Number.isFinite(u)&&u<60&&s.speed>.05){let e=l?Math.sign(s.angularVelocity):1,n=c.x+Math.cos(s.heading)*u*e,r=c.z-Math.sin(s.heading)*u*e;i.strokeStyle=l?`rgba(255,215,90,0.9)`:`rgba(255,215,90,0.35)`,i.lineWidth=1.5*a,i.setLineDash(l?[]:[6*a,6*a]),i.beginPath();for(let e=0;e<=64;e++){let a=e/64*Math.PI*2,[o,s]=this.project(t,n+Math.cos(a)*u,.05,r+Math.sin(a)*u);e===0?i.moveTo(o,s):i.lineTo(o,s)}i.stroke(),i.setLineDash([])}let d=1.5+s.speed*.25;this.arrow(t,c.x,c.z,c.x+Math.sin(s.heading)*d,c.z+Math.cos(s.heading)*d,`#ff5a3c`,a),s.target!==null&&this.arrow(t,c.x,c.z,c.x+Math.sin(s.target)*3,c.z+Math.cos(s.target)*3,`#5ad2ff`,a);let[f,p]=this.project(t,c.x,2.8,c.z),m=[`speed ${s.speed.toFixed(2)}  mode ${s.mode}`,`turn radius ${Number.isFinite(u)?u.toFixed(2):`∞`}  rate ${(s.angularVelocity*57.3).toFixed(0)}°/s`,`delta ${(s.delta*57.3).toFixed(0)}°`];this.label(m,f+12*a,p-30*a,a),this.label(o,10*a,10*a,a)}arrow(e,t,n,r,i,a,o){let s=this.ctx,[c,l]=this.project(e,t,.05,n),[u,d]=this.project(e,r,.05,i);s.strokeStyle=a,s.fillStyle=a,s.lineWidth=3*o,s.beginPath(),s.moveTo(c,l),s.lineTo(u,d),s.stroke();let f=Math.atan2(d-l,u-c),p=10*o;s.beginPath(),s.moveTo(u+Math.cos(f)*p*.6,d+Math.sin(f)*p*.6),s.lineTo(u+Math.cos(f+2.4)*p,d+Math.sin(f+2.4)*p),s.lineTo(u+Math.cos(f-2.4)*p,d+Math.sin(f-2.4)*p),s.fill()}label(e,t,n,r){let i=this.ctx;i.font=`${Math.round(12*r)}px ui-monospace, Menlo, monospace`;let a=15*r,o=Math.max(...e.map(e=>i.measureText(e).width))+10*r;i.fillStyle=`rgba(20,12,8,0.7)`,i.fillRect(t-5*r,n-12*r,o,e.length*a+6*r),i.fillStyle=`#f4ecd8`,e.forEach((e,r)=>i.fillText(e,t,n+r*a))}},_u={A:`010101111101101`,B:`110101110101110`,C:`011100100100011`,D:`110101101101110`,E:`111100110100111`,F:`111100110100100`,G:`011100101101011`,H:`101101111101101`,I:`111010010010111`,J:`001001001101010`,K:`101101110101101`,L:`100100100100111`,M:`101111111101101`,N:`110101101101101`,O:`010101101101010`,P:`110101110100100`,Q:`010101101110011`,R:`110101110101101`,S:`011100010001110`,T:`111010010010010`,U:`101101101101111`,V:`101101101101010`,W:`101101111111101`,X:`101101010101101`,Y:`101101010010010`,Z:`111001010100111`,0:`111101101101111`,1:`010110010010111`,2:`110001010100111`,3:`110001010001110`,4:`101101111001001`,5:`111100110001110`,6:`011100111101111`,7:`111001010010010`,8:`111101111101111`,9:`111101111001110`," ":`000000000000000`,".":`000000000000010`,":":`000010000010000`,"-":`000000111000000`,"<":`001010100010001`,">":`100010001010100`,"&":`010100010101011`,$:`011110010011110`,"|":`010010010010010`,"(":`010100100100010`,")":`010001001001010`,"+":`000010111010000`,"%":`101001010100101`,",":`000000000010100`,"?":`110001010000010`,"'":`010010000000000`,"[":`110100100100110`,"]":`011001001001011`,"/":`001001010100100`,"!":`010010010000010`};function Z(e){return e.length*4-1}function Q(e,t,n,r,i,a){a&&Q(e,t,n+1,r+1,a),e.fillStyle=i;let o=Math.round(n),s=Math.round(r);for(let n of t.toUpperCase()){let t=_u[n]??_u[` `];for(let n=0;n<15;n++)t[n]===`1`&&e.fillRect(o+n%3,s+Math.floor(n/3),1,1);o+=4}}function vu(e,t,n,r,i,a,o){o&&vu(e,t,n+a,r+a,o,a),e.fillStyle=i;let s=Math.round(n),c=Math.round(r);for(let n of t.toUpperCase()){let t=_u[n]??_u[` `];for(let n=0;n<15;n++)t[n]===`1`&&e.fillRect(s+n%3*a,c+Math.floor(n/3)*a,a,a);s+=4*a}}function yu(e,t){return(e.length*4-1)*t}var $={ink:`#1f1510`,outline:`#2b1d14`,darkBrown:`#3f2a1c`,leather:`#5a3a24`,wood:`#7a4e2d`,woodLight:`#9c6b3e`,woodPale:`#b5834f`,sand:`#dcbc82`,cream:`#f4ecd8`,brass:`#d9a441`,brassLight:`#f7d774`,rust:`#b5562b`,red:`#a33a2a`,green:`#8a9e52`,cell:`#2e211a`,cellLine:`#46301f`,valid:`rgba(138,158,82,0.45)`,invalid:`rgba(163,58,42,0.55)`},bu={stand:[`.###.`,`#####`,`.##..`,`.###.`,`#####`,`#.#.#`,`..#..`,`.#.#.`,`.#.#.`,`.#.#.`,`##.##`],crouch:[`.###..`,`#####.`,`.##...`,`.###..`,`######`,`.##.#.`,`.###..`,`#..#..`,`##.##.`]};function xu(e,t,n,r,i){if(r.slots.forEach((i,a)=>{let o=t+a*38;e.fillStyle=`rgba(31,21,16,0.6)`,e.fillRect(o,n,36,18),e.fillStyle=i.selected?r.drawn?$.brassLight:$.cream:$.leather,e.fillRect(o,n,36,1),e.fillRect(o,n+18-1,36,1),e.fillRect(o,n,1,18),e.fillRect(o+36-1,n,1,18),i.icon&&Su(e,i.icon,o+1,n+1,34,16,!1,i.selected?1:.6),Q(e,String(a+1),o+2,n+2,i.selected?$.brassLight:$.cream,$.ink)}),r.stance){let i=t+114;e.fillStyle=`rgba(31,21,16,0.6)`,e.fillRect(i,n,12,18);let a=bu[r.stance],o=n+18-2-a.length;a.forEach((t,n)=>{for(let a=0;a<t.length;a++)t[a]===`#`&&(e.fillStyle=r.stance===`crouch`?$.brassLight:$.cream,e.fillRect(i+3+a,o+n,1,1))})}if(r.ammo){let a=n-8,o=r.ammo,s=`${o.loaded}/${o.magazine}`;e.fillStyle=`rgba(31,21,16,0.55)`;let c=`| ${o.reserve}`;if(e.fillRect(t,a-2,Z(s)+Z(c)+10,9),Q(e,s,t+3,a,o.loaded===0?$.rust:$.cream),Q(e,c,t+7+Z(s),a,o.reserve===0?$.rust:$.sand),r.noAmmo&&Math.floor(i*4)%2==0)Q(e,`NO AMMO`,t+14+Z(s)+Z(c),a,$.red,$.ink);else if(r.reloadProgress>=0){let n=t+14+Z(s)+Z(c);Q(e,`RELOADING`,n,a,$.cream,$.ink),e.fillStyle=$.ink,e.fillRect(n-1,a+7,38,3),e.fillStyle=$.rust,e.fillRect(n,a+8,Math.round(36*r.reloadProgress),1)}else o.loaded===0&&o.reserve>0&&Math.floor(i*3)%2==0&&Q(e,`R TO RELOAD`,t+14+Z(s)+Z(c),a,$.cream,$.ink)}}function Su(e,t,n,r,i,a,o,s=1){let c=o?t.height:t.width,l=o?t.width:t.height,u=Math.floor(Math.min(i/c,a/l)),d=c*u,f=l*u;if(u<1){let e=Math.min(i/c,a/l);d=Math.floor(c*e),f=Math.floor(l*e),u=e}let p=Math.round(n+(i-d)/2),m=Math.round(r+(a-f)/2);e.save(),e.globalAlpha=s,e.imageSmoothingEnabled=!1,o?(e.translate(p+d,m),e.rotate(Math.PI/2),e.drawImage(t,0,0,f,d)):e.drawImage(t,p,m,d,f),e.restore()}var Cu={ink:`#1f1510`,brass:`#d9a441`,brassLight:`#f7d774`,empty:`#5a3a24`,cream:`#f4ecd8`,rust:`#b5562b`,red:`#a33a2a`},wu=class{canvas=document.createElement(`canvas`);ctx;time=0;constructor(e){this.canvas.style.pointerEvents=`none`,e.appendChild(this.canvas),this.ctx=this.canvas.getContext(`2d`)}setSize(e,t,n,r,i,a){this.canvas.width=e,this.canvas.height=t,Object.assign(this.canvas.style,{width:`${n}px`,height:`${r}px`,left:i,top:a}),this.ctx.imageSmoothingEnabled=!1}clear(){return this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx}get context(){return this.ctx}draw(e,t){this.time+=e;let n=this.ctx,r=this.canvas.width,i=this.canvas.height;n.clearRect(0,0,r,i);for(let e of t.labels)this.label(e,r,i);if(t.hurt>.01&&(n.fillStyle=`rgba(163,58,42,${(t.hurt*.55).toFixed(3)})`,n.fillRect(0,0,r,4),n.fillRect(0,i-4,r,4),n.fillRect(0,4,4,i-8),n.fillRect(r-4,4,4,i-8)),t.dead){n.fillStyle=`rgba(31,21,16,0.45)`,n.fillRect(0,0,r,i);let e=t.deathMessage;Q(n,e,Math.round(r/2-Z(e)/2),Math.round(i*.42),Cu.red,Cu.ink)}n.fillStyle=`rgba(31,21,16,0.55)`,n.fillRect(3,3,57,9),Q(n,`HP`,5,5,Cu.cream,Cu.ink),n.fillStyle=Cu.ink,n.fillRect(15,5,42,5),n.fillStyle=t.hp/t.maxHp<.3&&Math.floor(this.time*4)%2?Cu.cream:Cu.red,n.fillRect(16,6,Math.ceil(40*t.hp/t.maxHp),3),t.healProgress>=0&&(Q(n,`BANDAGING`,5,14,Cu.cream,Cu.ink),n.fillStyle=Cu.ink,n.fillRect(41,15,22,3),n.fillStyle=`#8a9e52`,n.fillRect(42,16,Math.round(20*t.healProgress),1));let a=i-18-4;if(xu(n,4,a,t.weaponBar,this.time),t.mounted&&t.speedLabel&&Q(n,t.speedLabel,122,a+6,Cu.cream,Cu.ink),t.toast){let e=Z(t.toast),a=Math.round(r/2-e/2),o=Math.round(i*.72);n.fillStyle=`rgba(31,21,16,0.7)`,n.fillRect(a-3,o-2,e+6,9),Q(n,t.toast,a,o,Cu.brassLight)}if(t.prompt){let e=Z(t.prompt),a=Math.round(r/2-e/2),o=Math.round(i*.62);n.fillStyle=`rgba(31,21,16,0.6)`,n.fillRect(a-3,o-2,e+6,9),Q(n,t.prompt,a,o,Cu.cream)}t.pixelate||Q(n,`PIXEL OFF [P]`,r-Z(`PIXEL OFF [P]`)-4,i-10,Cu.cream,Cu.ink),t.cursorX!==null&&t.cursorY!==null&&!t.menuOpen&&this.crosshair(t.cursorX,t.cursorY,t.weaponBar.reloadProgress>=0)}label(e,t,n){let r=this.ctx;if(e.kind===`alert`){Q(r,`!`,Math.round(e.x-1),Math.round(e.y-5),Cu.red,Cu.ink);return}if(e.kind===`speech`){let i=Eu(e.text.toUpperCase(),24),a=Math.max(...i.map(Z)),o=a+6,s=i.length*7+3,c=Tu(Math.round(e.x-o/2),1,t-o-1),l=Tu(Math.round(e.y-s-3),1,n-s-4);r.fillStyle=Cu.ink,r.fillRect(c-1,l-1,o+2,s+2),r.fillStyle=Cu.cream,r.fillRect(c,l,o,s);let u=Tu(Math.round(e.x),c+2,c+o-3);r.fillStyle=Cu.ink,r.fillRect(u-2,l+s,5,2),r.fillRect(u-1,l+s+2,3,1),r.fillStyle=Cu.cream,r.fillRect(u-1,l+s,3,1),r.fillRect(u,l+s+1,1,1),i.forEach((e,t)=>Q(r,e,c+3+Math.round((a-Z(e))/2),l+2+t*7,Cu.ink));return}let i=Z(e.text),a=Tu(Math.round(e.x-i/2),2,t-i-2),o=Tu(Math.round(e.y-5),2,n-8);e.kind===`prompt`?(r.fillStyle=`rgba(31,21,16,0.7)`,r.fillRect(a-3,o-2,i+6,9),Q(r,e.text,a,o,Cu.brassLight)):Q(r,e.text,a,o,Cu.cream,Cu.ink)}crosshair(e,t,n){let r=this.ctx,i=n?Cu.rust:Cu.cream,a=[[-5,0,3,1],[3,0,3,1],[0,-5,1,3],[0,3,1,3]];r.fillStyle=Cu.ink;for(let[n,i,o,s]of a)r.fillRect(e+n-(o>1?0:1),t+i-(s>1?0:1),o+(o>1?0:2),s+(s>1?0:2));r.fillRect(e-1,t-1,3,3),r.fillStyle=i;for(let[n,i,o,s]of a)r.fillRect(e+n,t+i,o,s);r.fillStyle=Cu.red,r.fillRect(e,t,1,1)}};function Tu(e,t,n){return Math.max(t,Math.min(n,e))}function Eu(e,t){let n=[],r=``;for(let i of e.split(` `))r&&r.length+1+i.length>t?(n.push(r),r=i):r=r?`${r} ${i}`:i;return r&&n.push(r),n}var Du=class{renderer;input;pixelPass=new mu;rig=new Sl;hud;debug;icons;pixelate=q.render.pixelate;lowW=q.render.baseWidth;lowH=q.render.baseHeight;scale=1;uiPointer={x:0,y:0,pressed:!1,released:!1,moved:!1};lastTime=0;constructor(e){this.renderer=new il({antialias:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=0,this.renderer.shadowMap.autoUpdate=!1,this.renderer.outputColorSpace=ze,this.renderer.info.autoReset=!1,e.appendChild(this.renderer.domElement),this.input=new Cl(e),this.hud=new wu(e),this.debug=new gu(e),this.icons=new du(this.renderer),this.icons.warm([8,16]),window.addEventListener(`resize`,()=>this.resize()),this.resize()}resize(){let e=window.devicePixelRatio||1,t=Math.max(1,Math.floor(window.innerWidth*e)),n=Math.max(1,Math.floor(window.innerHeight*e)),r=q.render;this.scale=Math.max(1,Math.floor(Math.min(t/r.baseWidth,n/r.baseHeight))),this.lowW=Math.ceil(t/this.scale),this.lowH=Math.ceil(n/this.scale);let i=this.lowW*this.scale,a=this.lowH*this.scale;this.renderer.setSize(i,a,!1);let o=i/e,s=a/e,c=`${Math.floor((window.innerWidth-o)/2)}px`,l=`${Math.floor((window.innerHeight-s)/2)}px`;Object.assign(this.renderer.domElement.style,{width:`${o}px`,height:`${s}px`,left:c,top:l}),this.hud.setSize(this.lowW,this.lowH,o,s,c,l),this.debug.setSize(i,a,o,s,c,l),this.rig.setViewport(this.lowW,this.lowH),this.pixelPass.setSize(this.lowW,this.lowH,this.scale)}start(e){this.lastTime=performance.now(),this.renderer.setAnimationLoop(t=>{let n=Math.min(.1,(t-this.lastTime)/1e3);this.lastTime=t,this.handleToggles(),e(n)})}handleToggles(){let e=this.input;e.consume(`KeyP`)&&(this.pixelate=!this.pixelate),e.consume(`KeyO`)&&(this.pixelPass.quantize=!this.pixelPass.quantize),e.consume(`KeyL`)&&(this.pixelPass.outlines=!this.pixelPass.outlines),e.consume(`F3`)&&(this.debug.visible=!this.debug.visible)}pointer(){let e=this.input,t=this.renderer.domElement.getBoundingClientRect(),n=Math.floor((e.mouseX-t.left)/t.width*this.lowW),r=Math.floor((e.mouseY-t.top)/t.height*this.lowH);return this.uiPointer.moved=n!==this.uiPointer.x||r!==this.uiPointer.y,this.uiPointer.x=n,this.uiPointer.y=r,this.uiPointer.pressed=e.consume(`Mouse0`),this.uiPointer.released=e.consume(`Mouse0Up`),this.uiPointer.secondary=e.consume(`Mouse2`),this.uiPointer}renderScene(e){this.pixelate?this.pixelPass.render(this.renderer,e,this.rig.camera,this.rig.subpixel):(this.renderer.shadowMap.needsUpdate=!0,this.renderer.setRenderTarget(null),this.renderer.render(e,this.rig.view))}};function Ou(){try{return Number(localStorage.getItem(q.game.bestWaveKey))||0}catch{return 0}}function ku(e){let t=Math.max(Ou(),e);try{localStorage.setItem(q.game.bestWaveKey,String(t))}catch{}return t}var Au=1;function ju(){return Au++}function Mu(e,t=1,n){let r=zl(e),i={uid:ju(),defId:e,quantity:Math.min(t,r.maxStack),rotated:!1},a=Bl(r);return a&&(i.loadedRounds=n??a.magazine),i}function Nu(e,t=e.rotated){let{w:n,h:r}=zl(e.defId).size;return t?{w:r,h:n}:{w:n,h:r}}function Pu(e){let t=zl(e.defId);return t.stackable?`${t.name} x${e.quantity}`:t.name}var Fu=(e,t,n)=>t>=e.x&&n>=e.y&&t<e.x+e.w&&n<e.y+e.h;function Iu(e,t,n){let{x:r,y:i,w:a,h:o}=t;e.fillStyle=$.ink,e.fillRect(r-4,i-4,a+8,o+8),e.fillStyle=$.wood,e.fillRect(r-3,i-3,a+6,o+6),e.fillStyle=$.woodPale,e.fillRect(r-3,i-3,a+6,1),e.fillRect(r-3,i-3,1,o+6),e.fillStyle=$.darkBrown,e.fillRect(r-3,i+o+2,a+6,1),e.fillRect(r+a+2,i-3,1,o+6),e.fillStyle=$.brass;for(let[t,n]of[[r-2,i-2],[r+a+1,i-2],[r-2,i+o+1],[r+a+1,i+o+1]])e.fillRect(t,n,1,1);e.fillStyle=$.ink,e.fillRect(r-1,i-1,a+2,o+2),e.fillStyle=$.leather,e.fillRect(r,i,a,o);let s=Z(n)+8,c=Math.round(r+a/2-s/2);e.fillStyle=$.ink,e.fillRect(c-1,i-7,s+2,11),e.fillStyle=$.darkBrown,e.fillRect(c,i-6,s,9),Q(e,n,c+4,i-4,$.brassLight)}function Lu(e,t,n,r){let{grid:i,cell:a}=t;e.fillStyle=$.ink,e.fillRect(t.x-1,t.y-1,t.w+2,t.h+2);for(let n=0;n<i.h;n++)for(let r=0;r<i.w;r++)e.fillStyle=$.cellLine,e.fillRect(t.x+r*a,t.y+n*a,a,a),e.fillStyle=$.cell,e.fillRect(t.x+r*a+1,t.y+n*a+1,a-1,a-1);for(let o of i.placements){if(o.item===r)continue;let i=Nu(o.item),s={x:t.x+o.x*a,y:t.y+o.y*a,w:i.w*a,h:i.h*a};e.fillStyle=`rgba(156,107,62,0.25)`,e.fillRect(s.x+1,s.y+1,s.w-1,s.h-1),Ru(e,o.item,s,n)}}function Ru(e,t,n,r,i=1){let a=zl(t.defId),o=Nu(t),s=o.w*16<=n.w&&o.h*16<=n.h?16:8;if(Su(e,r.get(t.defId,s),n.x,n.y,n.w,n.h,t.rotated,i),a.stackable){let r=String(t.quantity);Q(e,r,n.x+n.w-Z(r)-1,n.y+n.h-6,$.cream,$.ink)}else if(t.loadedRounds!==void 0){let r=String(t.loadedRounds);Q(e,r,n.x+n.w-Z(r)-1,n.y+n.h-6,$.brassLight,$.ink)}}function zu(e,t,n,r,i=!1){e.fillStyle=$.ink,e.fillRect(t.x-1,t.y-1,t.w+2,t.h+2),e.fillStyle=i?$.darkBrown:$.cell,e.fillRect(t.x,t.y,t.w,t.h),e.fillStyle=$.cellLine,e.fillRect(t.x,t.y,t.w,1);let a=t.holder.get(t.key);a&&a!==r?Ru(e,a,{x:t.x+1,y:t.y+1,w:t.w-2,h:t.h-2},n):Q(e,t.label,t.x+Math.round((t.w-Z(t.label))/2),t.y+Math.round(t.h/2-2),$.cellLine)}function Bu(e,t,n){e.fillStyle=$.ink,e.fillRect(t.x-1,t.y-1,t.w+2,t.h+2),e.fillStyle=n?$.woodLight:$.wood,e.fillRect(t.x,t.y,t.w,t.h),e.fillStyle=$.woodPale,e.fillRect(t.x,t.y,t.w,1),Q(e,t.label,t.x+Math.round((t.w-Z(t.label))/2),t.y+Math.round(t.h/2-2),$.cream,$.ink)}function Vu(e,t,n,r,i,a){let o=Math.max(...t.map(e=>Z(e.text)))+8,s=t.length*7+5,c=Math.min(i-o-2,n+8),l=Math.min(a-s-2,r+8);e.fillStyle=$.ink,e.fillRect(c-1,l-1,o+2,s+2),e.fillStyle=$.darkBrown,e.fillRect(c,l,o,s),t.forEach((t,n)=>Q(e,t.text,c+4,l+3+n*7,t.color??$.cream))}function Hu(e,t){let n=[],r=``;for(let i of e.split(` `))r&&r.length+1+i.length>t?(n.push(r),r=i):r=r?`${r} ${i}`:i;return r&&n.push(r),n}function Uu(e,t,n){[`1`,`11`,`121`,`1221`,`12221`,`122221`,`1222111`,`12121`,`11 121`,`   11`].forEach((r,i)=>{for(let a=0;a<r.length;a++)r[a]!==` `&&(e.fillStyle=r[a]===`1`?$.ink:$.cream,e.fillRect(Math.round(t)+a,Math.round(n)+i,1,1))})}function Wu(e){let t=(...t)=>t.map(t=>e.consume(t)).some(Boolean);return{up:t(`KeyW`,`ArrowUp`),down:t(`KeyS`,`ArrowDown`),confirm:t(`Enter`,`NumpadEnter`,`Space`),back:t(`Escape`)}}var Gu=class{items;w;h;gap;focus=0;rects=[];constructor(e,t=120,n=16,r=5){this.items=e,this.w=t,this.h=n,this.gap=r}get height(){return this.items.length*this.h+(this.items.length-1)*this.gap}update(e,t,n,r){this.rects=this.items.map((n,r)=>({x:e,y:t+r*(this.h+this.gap),w:this.w,h:this.h}));let i=this.items.length;r.up&&(this.focus=(this.focus+i-1)%i),r.down&&(this.focus=(this.focus+1)%i);let a=this.rects.findIndex(e=>Fu(e,n.x,n.y));a>=0&&(n.moved||n.pressed)&&(this.focus=a),r.confirm?this.items[this.focus].action():n.released&&a>=0&&a===this.focus&&this.items[a].action()}draw(e){this.items.forEach((t,n)=>{let r=this.rects[n];if(!r)return;let i=n===this.focus;e.fillStyle=$.ink,e.fillRect(r.x-1,r.y-1,r.w+2,r.h+2),e.fillStyle=i?$.woodLight:$.wood,e.fillRect(r.x,r.y,r.w,r.h),e.fillStyle=i?$.brassLight:$.woodPale,e.fillRect(r.x,r.y,r.w,1),i&&(e.fillStyle=$.brassLight,e.fillRect(r.x+3,r.y+Math.floor(r.h/2)-2,2,5));let a=t.dim?$.woodPale:i?$.brassLight:$.cream,o=t.sub?r.y+3:r.y+Math.round(r.h/2-2);Q(e,t.label,r.x+Math.round((r.w-Z(t.label))/2),o,a,$.ink),t.sub&&Q(e,t.sub,r.x+Math.round((r.w-Z(t.sub))/2),r.y+r.h-7,t.dim?$.woodPale:$.sand)})}get focused(){return this.items[this.focus]}},Ku=class{title;text;items;focus=0;buttons=[];constructor(e,t,n){this.title=e,this.text=t,this.items=n}rect(e,t){let n=26+Hu(this.text.toUpperCase(),38).length*7+20;return{x:Math.round((e-170)/2),y:Math.round((t-n)/2),w:170,h:n}}update(e,t,n,r){let i=this.rect(e,t),a=this.items.length,o=Math.round(i.x+(i.w-(a*60+(a-1)*6))/2);if(this.buttons=this.items.map((e,t)=>({x:o+t*66,y:i.y+i.h-18,w:60,h:13})),r.back)return this.items[a-1].action();(r.up||r.down)&&(this.focus=(this.focus+1)%a);let s=this.buttons.findIndex(e=>Fu(e,n.x,n.y));s>=0&&(n.moved||n.pressed)&&(this.focus=s),r.confirm?this.items[this.focus].action():n.released&&s>=0&&this.items[s].action()}draw(e,t,n){let r=this.rect(t,n);Iu(e,r,this.title),Hu(this.text.toUpperCase(),38).forEach((t,n)=>Q(e,t,r.x+Math.round((r.w-Z(t))/2),r.y+12+n*7,$.cream)),this.items.forEach((t,n)=>{let r=this.buttons[n];if(!r)return;let i=n===this.focus;e.fillStyle=$.ink,e.fillRect(r.x-1,r.y-1,r.w+2,r.h+2),e.fillStyle=i?$.woodLight:$.wood,e.fillRect(r.x,r.y,r.w,r.h),e.fillStyle=i?$.brassLight:$.woodPale,e.fillRect(r.x,r.y,r.w,1),Q(e,t.label,r.x+Math.round((r.w-Z(t.label))/2),r.y+4,i?$.brassLight:$.cream,$.ink)})}};function qu(e,t,n,r=.55){e.fillStyle=`rgba(31,21,16,${r})`,e.fillRect(0,0,t,n)}function Ju(e){let t=Math.floor(e/60),n=Math.floor(e%60);return`${t}:${String(n).padStart(2,`0`)}`}var Yu=class{engine;stats;best;list;constructor(e,t,n,r){this.engine=e,this.stats=t,this.best=n,this.list=new Gu([{label:`RETRY`,action:()=>r.retry()},{label:`MAIN MENU`,action:()=>r.mainMenu()}],90,15,4)}frame(){let e=this.engine,t=e.lowW,n=e.lowH,r=e.hud.context,i=e.pointer(),a=Wu(e.input);qu(r,t,n,.6);let o=this.stats,s=[[`WAVES SURVIVED`,String(o.wavesSurvived)],[`KILLS`,String(o.kills)],[`DOLLARS EARNED`,`$${o.dollarsEarned}`],[`TIME SURVIVED`,Ju(o.timeSurvived)],[`BEST WAVE`,String(this.best)]],c=s.length*9+14+this.list.height+12,l=Math.round((t-150)/2),u=Math.round(n/2-c/2+10),d=`GAME OVER`;vu(r,d,Math.round((t-yu(d,3))/2),u-30,$.red,3,$.ink),Iu(r,{x:l,y:u,w:150,h:c},`YOUR RUN`),s.forEach(([e,t],n)=>{Q(r,e,l+10,u+10+n*9,$.sand),Q(r,t,l+150-10-Z(t),u+10+n*9,$.brassLight)}),this.list.update(l+Math.round((150-this.list.w)/2),u+14+s.length*9,i,a),this.list.draw(r),Uu(r,i.x,i.y)}};function Xu(e){let t=new Set,n=new Set;e.traverse(e=>{let r=e;r.geometry&&t.add(r.geometry);let i=r.material;Array.isArray(i)?i.forEach(e=>n.add(e)):i&&n.add(i);let a=e;a.isLight&&a.shadow?.map&&a.shadow.map.dispose()});for(let e of t)e.dispose();for(let e of n)if(!e.userData.shared){for(let t of Object.values(e))t instanceof Ot&&!t.userData.shared&&t.dispose();e.dispose()}}function Zu(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new ur,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Qu(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Qu(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function Qu(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Yn(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var $u=new W,ed=new Pt,td=new dt,nd=new Wt,rd=new V,id=new V,ad=class{geos=[];add(e,t,n){let r=e.index?e.toNonIndexed():e.clone();r.deleteAttribute(`uv`),r.applyMatrix4(n),r.computeVertexNormals(),$u.setHex(t);let i=r.getAttribute(`position`).count,a=new Float32Array(i*3);for(let e=0;e<i;e++)a.set([$u.r,$u.g,$u.b],e*3);r.setAttribute(`color`,new Yn(a,3));for(let e of Object.keys(r.attributes))e!==`position`&&e!==`normal`&&e!==`color`&&r.deleteAttribute(e);this.geos.push(r),r!==e&&e.dispose()}put(e,t,n,r,i,a=0,o=0,s=0,c=1,l=1,u=1){td.setFromEuler(nd.set(a,o,s)),ed.compose(rd.set(n,r,i),td,id.set(c,l,u)),this.add(e,t,ed)}box(e,t,n,r,i,a,o,s=0,c){let l=new mi(e,t,n);l.translate(0,t/2,0),td.setFromEuler(nd.set(0,s,0)),ed.compose(rd.set(i,a,o),td,id.set(1,1,1)),c&&ed.premultiply(c),this.add(l,r,ed)}get isEmpty(){return this.geos.length===0}build(e=Jl()){let t=Zu(this.geos,!1);for(let e of this.geos)e.dispose();this.geos=[];let n=new Pr(t,e);return n.castShadow=!0,n.receiveShadow=!0,n}},od=4,sd=class{halfSize;colliders=[];grid=new Map;stamp=new Map;queryId=0;constructor(e){this.halfSize=e}addCircle(e,t,n,r,i,a=!0){let o={kind:`circle`,x:e,z:t,r:n,coverHeight:r,surface:i,blocksBullets:a};return this.insert(o,e-n,t-n,e+n,t+n),o}addBox(e,t,n,r,i,a,o=!0){let s={kind:`box`,minX:e,minZ:t,maxX:n,maxZ:r,coverHeight:i,surface:a,blocksBullets:o};return this.insert(s,e,t,n,r),s}key(e,t){return(e+1e3)*4096+(t+1e3)}insert(e,t,n,r,i){this.colliders.push(e);for(let a=Math.floor(t/od);a<=Math.floor(r/od);a++)for(let t=Math.floor(n/od);t<=Math.floor(i/od);t++){let n=this.key(a,t),r=this.grid.get(n);r||this.grid.set(n,r=[]),r.push(e)}}query(e,t,n,r,i){i.length=0;let a=++this.queryId;for(let o=Math.floor(e/od);o<=Math.floor(n/od);o++)for(let e=Math.floor(t/od);e<=Math.floor(r/od);e++){let t=this.grid.get(this.key(o,e));if(t)for(let e of t)this.stamp.get(e)!==a&&(this.stamp.set(e,a),i.push(e))}return i}scratch=[];resolveCircle(e,t,n){let r={hit:!1,nx:0,nz:0,depth:0};for(let i=0;i<3;i++){let i=!1,a=this.query(e.x-t,e.z-t,e.x+t,e.z+t,this.scratch),o=n?a.concat(n):a;for(let n of o){if((n.base??0)>0)continue;let a=n.kind===`circle`?cd(e,t,n):ld(e,t,n);a&&(i=!0,(!r.hit||a.depth>r.depth)&&Object.assign(r,a,{hit:!0}))}let s=this.halfSize-t;for(let[t,n]of[[`x`,1],[`x`,-1],[`z`,1],[`z`,-1]]){let a=e[t]*n;if(a>s){e[t]=s*n,i=!0;let o=a-s;(!r.hit||o>r.depth)&&Object.assign(r,{hit:!0,depth:o,nx:t===`x`?-n:0,nz:t===`z`?-n:0})}}if(!i)break}return r}blocksStanding(e,t,n,r,i){return this.query(e-n,t-n,e+n,t+n,this.scratch).some(a=>{let o=a.base??0;if(o<=0||o>=i||a.coverHeight<=r)return!1;if(a.kind===`circle`)return Math.hypot(e-a.x,t-a.z)<n+a.r;let s=Math.max(a.minX,Math.min(e,a.maxX)),c=Math.max(a.minZ,Math.min(t,a.maxZ));return Math.hypot(e-s,t-c)<n})}raycast(e,t,n,r,i,a){let o=null;i<=0&&t>0&&(o={t:t/(t-i),nx:0,ny:1,nz:0,surface:`dirt`,collider:null});let s=this.query(Math.min(e,r),Math.min(n,a),Math.max(e,r),Math.max(n,a),this.scratch);for(let c of s){if(!c.blocksBullets)continue;let s=c.kind===`circle`?dd(e,t,n,r,i,a,c.x,c.z,c.r,c.base??0,c.coverHeight):fd(e,t,n,r,i,a,c.minX,c.minZ,c.maxX,c.maxZ,c.coverHeight,c.base??0);s&&(!o||s.t<o.t)&&(s.surface=c.surface,s.collider=c,o=s)}return o}};function cd(e,t,n){let r=e.x-n.x,i=e.z-n.z,a=t+n.r,o=r*r+i*i;if(o>=a*a)return null;let s=Math.sqrt(o)||1e-6,c=o>1e-12?r/s:1,l=o>1e-12?i/s:0;return e.x=n.x+c*a,e.z=n.z+l*a,{nx:c,nz:l,depth:a-s}}function ld(e,t,n){let r=Math.max(n.minX,Math.min(e.x,n.maxX)),i=Math.max(n.minZ,Math.min(e.z,n.maxZ)),a=e.x-r,o=e.z-i,s=a*a+o*o;if(s>=t*t)return null;if(s>1e-12){let n=Math.sqrt(s),c=a/n,l=o/n;return e.x=r+c*t,e.z=i+l*t,{nx:c,nz:l,depth:t-n}}let c=[{d:e.x-n.minX,nx:-1,nz:0},{d:n.maxX-e.x,nx:1,nz:0},{d:e.z-n.minZ,nx:0,nz:-1},{d:n.maxZ-e.z,nx:0,nz:1}].sort((e,t)=>e.d-t.d)[0];return e.x+=c.nx*(c.d+t),e.z+=c.nz*(c.d+t),{nx:c.nx,nz:c.nz,depth:c.d+t}}function ud(e,t,n,r){let i=t-e;if(Math.abs(i)<1e-9)return e>=n&&e<=r?[-1/0,1/0]:null;let a=(n-e)/i,o=(r-e)/i;return a>o&&([a,o]=[o,a]),[a,o]}function dd(e,t,n,r,i,a,o,s,c,l,u){let d=r-e,f=a-n,p=e-o,m=n-s,h=d*d+f*f,g=p*p+m*m-c*c,_,v;if(h<1e-12){if(g>0)return null;_=-1/0,v=1/0}else{let e=2*(p*d+m*f),t=e*e-4*h*g;if(t<0)return null;let n=Math.sqrt(t);_=(-e-n)/(2*h),v=(-e+n)/(2*h)}let y=ud(t,i,l,u);if(!y)return null;let b=Math.max(_,y[0],0);if(b>Math.min(v,y[1],1))return null;if(b===y[0]&&y[0]>_)return{t:b,nx:0,ny:i<t?1:-1,nz:0,surface:`dirt`,collider:null};let x=e+d*b-o,S=n+f*b-s,C=Math.hypot(x,S)||1;return{t:b,nx:x/C,ny:0,nz:S/C,surface:`dirt`,collider:null}}function fd(e,t,n,r,i,a,o,s,c,l,u,d=0){let f=0,p=1,m=0,h=0,g=0,_=[[e,r-e,o,c,`x`],[t,i-t,d,u,`y`],[n,a-n,s,l,`z`]];for(let[e,t,n,r,i]of _){if(Math.abs(t)<1e-12){if(e<n||e>r)return null;continue}let a=(n-e)/t,o=(r-e)/t,s=-1;if(a>o&&([a,o]=[o,a],s=1),a>f&&(f=a,m=i===`x`?s:0,h=i===`y`?s:0,g=i===`z`?s:0),p=Math.min(p,o),f>p)return null}return{t:f,nx:m,ny:h,nz:g,surface:`dirt`,collider:null}}function pd(e,t){let n=new W(e),r={h:0,s:0,l:0};return n.getHSL(r),n.setHSL(r.h,r.s,Math.max(0,Math.min(1,r.l*t))),n.getHex()}function md(e){let t=new Si(200,200,200,200).toNonIndexed();t.rotateX(-Math.PI/2),t.deleteAttribute(`uv`);let n=t.getAttribute(`position`),r=new Float32Array(n.count*3),i=new W,a=new bl(99);for(let t=0;t<n.count/3;t++){let o=0,s=0;for(let e=0;e<3;e++)o+=n.getX(t*3+e),s+=n.getZ(t*3+e);let c=Math.floor(o/3),l=Math.floor(s/3);i.setHex(e(c+.5,l+.5,a,t%2==0));for(let e=0;e<3;e++)r.set([i.r,i.g,i.b],(t*3+e)*3)}t.setAttribute(`color`,new Yn(r,3)),t.computeVertexNormals();let o=new Pr(t,Jl());return o.receiveShadow=!0,o}function hd(e,t,n,r,i,a,o,s,c,l){let u=new ad,d=new Pt().compose(new V(t,0,n),new dt().setFromAxisAngle(cn.DEFAULT_UP,r),new V(1,1,1)),f=(e,t,n,r,i,a,o)=>u.box(e,t,n,r,i,a,o,0,d),p=pd(s,.72),m=l.pick([J.darkBrown,J.brown,J.rust]),h=1.1+l.range(0,.7);f(i,o,a,s,0,0,0);for(let e=.55;e<o-.2;e+=.55)f(i+.04,.08,a+.04,p,0,e,0);for(let e of[-1,1])for(let t of[-1,1])f(.2,o,.2,p,e*i/2,0,t*a/2);f(i+.4,.22,a+.4,m,0,o,0),f(i+.24,h,.2,s,0,o,a/2-.02),f(i+.5,.16,.34,p,0,o+h,a/2-.02),f(i*.62,.62,.08,c,0,o+h*.18,a/2+.12);let g=Math.floor(i*.9);for(let e=0;e<g;e++){let t=(e-(g-1)/2)*.5;l.next()<.85&&f(.3,.3,.04,c===J.cream?J.ink:J.cream,t,o+h*.18+.16,a/2+.17)}f(1.1,2,.08,p,0,0,a/2+.02),f(.9,1.85,.1,J.darkBrown,0,0,a/2+.04);for(let e of[-1,1]){let t=e*Math.min(i/2-1.1,2);f(1,.95,.08,p,t,.95,a/2+.02),f(.8,.75,.1,J.skyDeep,t,1.05,a/2+.04),f(.06,.75,.12,p,t,1.05,a/2+.05),o>4.6&&(f(.9,.9,.08,p,t,3.3,a/2+.02),f(.7,.7,.1,J.ink,t,3.4,a/2+.04))}for(let e of[-1,1])f(.08,.8,1,p,e*i/2+e*.02,1,0),f(.1,.6,.8,J.skyDeep,e*i/2+e*.04,1.1,0);let _=1.9;f(i+.3,.2,_,J.wood,0,0,a/2+_/2);for(let e=0;e<3;e++)f(.16,2.6,.16,p,(e-1)*(i+.1)/2,.2,a/2+_-.12);f(i+.5,.12,2.1999999999999997,m,0,2.75,a/2+_/2+.05);let v=Math.abs(Math.cos(r))>.5?i/2:a/2,y=Math.abs(Math.cos(r))>.5?a/2:i/2;e.addBox(t-v,n-y,t+v,n+y,o+h,`wood`);for(let t=0;t<3;t++){let n=new V((t-1)*(i+.1)/2,0,a/2+_-.12).applyMatrix4(d);e.addCircle(n.x,n.z,.12,2.8,`wood`)}let b=Yl(),x=u.build(b),S=new jn().setFromObject(x);return{mesh:x,fade:b.userData.uFade,minX:S.min.x,minZ:S.min.z,maxX:S.max.x,maxZ:S.max.z,height:S.max.y}}function gd(e,t,n,r,i,a){let o=Math.hypot(i-n,a-r),s=Math.max(1,Math.round(o/2)),c=[],l=Math.abs(i-n)>Math.abs(a-r);for(let t=0;t<=s;t++){let o=t/s,l=n+(i-n)*o,u=r+(a-r)*o;e.box(.2,1.05,.2,J.wood,l,0,u),e.box(.26,.06,.26,J.darkBrown,l,1.05,u),c.push(new V(l,1.11,u))}let u=(n+i)/2,d=(r+a)/2,f=l?0:Math.PI/2;e.box(o,.12,.08,J.woodLight,u,.42,d,f),e.box(o,.12,.08,J.woodLight,u,.8,d,f);let p=.12;return t.addBox(Math.min(n,i)-p,Math.min(r,a)-p,Math.max(n,i)+p,Math.max(r,a)+p,1.05,`wood`),c}function _d(e,t,n,r,i){let a=i.pick([J.wood,J.woodLight,J.rust]);e.put(new gi(.36,.36,1,8),a,n,.5,r),e.put(new gi(.39,.39,.08,8),J.metal,n,.22,r),e.put(new gi(.39,.39,.08,8),J.metal,n,.78,r),e.put(new gi(.3,.3,.04,8),pd(a,.7),n,1.01,r),t.addCircle(n,r,.4,1,`wood`)}function vd(e,t,n,r,i){let a=i.range(.7,.9);e.box(a,a,a,J.woodPale,n,0,r),e.box(a+.04,.1,a+.04,J.wood,n,a*.45,r),t.addBox(n-a/2,r-a/2,n+a/2,r+a/2,a,`wood`)}function yd(e,t,n,r){e.box(2.2,.6,.8,J.wood,n,0,r),e.box(2,.05,.6,J.skyDeep,n,.56,r),t.addBox(n-1.1,r-.4,n+1.1,r+.4,.6,`wood`)}function bd(e,t,n,r){for(let i of[-1,1])e.box(.16,1,.16,J.wood,n+i*1.2,0,r),t.addCircle(n+i*1.2,r,.12,1,`wood`);e.box(2.7,.12,.12,J.woodLight,n,.9,r)}function xd(e,t,n,r){e.put(new gi(.85,.9,.8,8),J.rock,n,.4,r),e.put(new gi(.62,.62,.05,8),J.ink,n,.81,r);for(let t of[-1,1])e.box(.14,1.9,.14,J.wood,n+t*.7,.4,r);e.box(1.7,.12,.12,J.woodLight,n,2,r),e.put(new _i(1.2,.6,4),J.rust,n,2.5,r,0,Math.PI/4,0),t.addCircle(n,r,.92,.82,`rock`)}function Sd(e,t,n,r){for(let i of[-1,1])for(let a of[-1,1])e.box(.22,4.2,.22,J.wood,n+i*1.3,0,r+a*1.3),t.addCircle(n+i*1.3,r+a*1.3,.16,4.2,`wood`);e.box(2.9,.12,.12,J.woodLight,n,2,r+1.3),e.box(2.9,.12,.12,J.woodLight,n,2,r-1.3),e.box(.12,.12,2.9,J.woodLight,n+1.3,2,r),e.box(.12,.12,2.9,J.woodLight,n-1.3,2,r),e.put(new gi(1.7,1.7,2.2,10),J.woodLight,n,5.3,r),e.put(new gi(1.75,1.75,.12,10),J.metal,n,4.7,r),e.put(new gi(1.75,1.75,.12,10),J.metal,n,5.8,r),e.put(new _i(1.95,1,10),J.rust,n,6.9,r)}function Cd(e,t,n,r,i){let a=i.next();if(a<.6){let a=i.range(1.8,3),o=i.pick([J.cactus,J.cactusDark]);e.put(new gi(.22,.27,a,6),o,n,a/2,r),e.put(new _i(.22,.25,6),o,n,a+.12,r);let s=i.int(1,3);for(let t=0;t<s;t++){let t=i.range(0,Math.PI*2),s=i.range(.8,a*.65),c=Math.sin(t),l=Math.cos(t);e.put(new gi(.13,.13,.5,6),o,n+c*.35,s,r+l*.35,0,t,Math.PI/2);let u=i.range(.5,.9);e.put(new gi(.13,.14,u,6),o,n+c*.62,s+u/2-.06,r+l*.62),e.put(new _i(.13,.14,6),o,n+c*.62,s+u+0,r+l*.62)}t.addCircle(n,r,.3,a,`cactus`)}else if(a<.8){for(let t=0;t<3;t++){let t=i.range(.2,.32),a=i.range(-.35,.35),o=i.range(-.35,.35);e.put(new gi(t*.8,t,t*1.6,7),J.cactusLight,n+a,t*.8,r+o),e.put(new _i(t*.5,.1,5),J.red,n+a,t*1.6+.04,r+o)}t.addCircle(n,r,.5,.6,`cactus`)}else{for(let t=0;t<5;t++){let a=i.range(.25,.38);e.put(new gi(a,a,.1,7),J.cactus,n+i.range(-.3,.3),.25+t*.16,r+i.range(-.3,.3),Math.PI/2,i.range(0,Math.PI),i.range(-.4,.4))}t.addCircle(n,r,.45,1,`cactus`)}}function wd(e,t,n,r,i){let a=i.range(.4,1.3),o=i.pick([J.rock,J.rockLight,J.sandDark,J.rockDark]);if(e.put(new yi(1,0),o,n,a*.35,r,i.range(0,3),i.range(0,3),i.range(0,3),a*i.range(.9,1.3),a*.75,a*i.range(.9,1.3)),i.next()<.5){let t=a*.5;e.put(new yi(1,0),pd(o,1.1),n+a*.9,t*.3,r+a*.4,i.range(0,3),i.range(0,3),0,t,t*.7,t)}t.addCircle(n,r,a*1.05,a*1.1,`rock`)}function Td(e,t,n,r){let i=r.pick([J.cactusLight,J.sandDark,J.woodPale]);for(let a=0;a<3;a++){let a=r.range(.15,.3);e.put(new bi(a,0),i,t+r.range(-.3,.3),a*.6,n+r.range(-.3,.3))}}function Ed(e,t,n){let r=[];for(let e=-n-6;e<=n+6;e+=5)r.push([e,-n-5],[e,n+5],[-n-5,e],[n+5,e]);for(let[n,i]of r){let r=n+t.range(-2,2),a=i+t.range(-2,2),o=t.range(4,7),s=t.range(4,7),c=t.range(2.5,6),l=[J.rustLight,J.orange,J.rust,J.sandDark],u=0,d=0;for(;u<c;){let n=t.range(.6,1.4),i=1-u/c*.25;e.box(o*i,n,s*i,l[d%l.length],r,u,a,t.range(-.1,.1)),u+=n,d++}}}function Dd(e,t,n,r,i=0,a=0,o=0){let s=new Pt().compose(new V(t,o,n),new dt().setFromEuler(new Wt(i,r,a,`YXZ`)),new V(1,1,1));return{box:(t,n,r,i,a,o,c,l=0)=>e.box(t,n,r,i,a,o,c,l,s),put:(t,n,r,i,a,o=0,c=0,l=0)=>{let u=t.clone();u.applyMatrix4(new Pt().compose(new V(r,i,a),new dt().setFromEuler(new Wt(o,c,l)),new V(1,1,1))),u.applyMatrix4(s),t.dispose(),e.add(u,n,new Pt)},m:s}}function Od(e,t,n,r,i,a,o,s){let c=Math.max(1,Math.round(i*2/(a*1.4)));for(let l=0;l<=c;l++){let u=-i+l/c*i*2;e.addCircle(t+Math.sin(r)*u,n+Math.cos(r)*u,a,o,s)}}function kd(e,t,n,r,i,a){let o=a===`broken`,{box:s,put:c}=Dd(e,n,r,i,o?.05:0,o?.16:0,o?-.12:0);s(1.5,.12,3,J.wood,0,.62,0);for(let e of[-1,1])s(.08,.42,3,J.woodLight,e*.72,.74,0);s(1.5,.42,.08,J.woodLight,0,.74,-1.48),o||s(1.5,.42,.08,J.woodLight,0,.74,1.48),s(.12,.1,1.6,J.wood,0,.45,2.2);let l=new gi(.5,.5,.1,10);for(let[e,t]of[[-1,-1],[1,-1],[-1,1],[1,1]])o&&e===1&&t===1||(c(l.clone(),J.darkBrown,e*.86,.5,t*1,0,0,Math.PI/2),c(new gi(.12,.12,.14,6),J.metal,e*.86,.5,t*1,0,0,Math.PI/2));if(l.dispose(),o&&e.put(new gi(.5,.5,.1,10),J.darkBrown,n+Math.cos(i)*1.6,.06,r-Math.sin(i)*1.6,0,0,0),a===`covered`){c(new gi(.8,.8,2.7,10,1,!0,-Math.PI/2,Math.PI),J.cream,0,1,0,Math.PI/2,0,0);for(let e of[-1.3,0,1.3])c(new wi(.81,.04,4,10,Math.PI),J.wood,0,1,e);s(1.4,.06,.06,J.wood,0,1,1.36)}Od(t,n,r,i,1.2,.8,a===`covered`?1.8:a===`broken`?1:1.15,`wood`)}function Ad(e,t,n,r,i,a,o){let s=.62,c=Math.max(1,Math.round(i/s));for(let t=0;t<3;t++){let l=t%2*s*.5;for(let u=0;u<c-t%2;u++){let c=-i/2+s/2+l+u*s,d=o.pick([J.sand,J.sandLight,J.sandDark]),f=a?n+c:n,p=a?r:r+c;e.put(new mi(s*.96,.24,.42),d,f,.12+t*.23,p,0,a?0:Math.PI/2,0,1,1,1)}}let l=a?i/2:.24,u=a?.24:i/2;t.addBox(n-l,r-u,n+l,r+u,.7400000000000001,`dirt`)}function jd(e,t,n,r,i,a,o){let s=J.woodLight,c=.18;e.box(i,.08,a,J.wood,n,0,r);let l=[[n-i/2,r-a/2,n+i/2,r-a/2],[n-i/2,r-a/2,n-i/2,r+a/2],[n+i/2,r-a/2,n+i/2,r+a/2],[n-i/2,r+a/2,n-.8,r+a/2],[n+.8,r+a/2,n+i/2,r+a/2]];for(let[n,r,i,a]of l){let l=Math.hypot(i-n,a-r),u=Math.abs(i-n)>Math.abs(a-r),d=Math.max(1,Math.round(l/1.2));for(let f=0;f<d;f++){if(o.next()<.18)continue;let p=f/d,m=(f+1)/d,h=n+(i-n)*(p+m)/2,g=r+(a-r)*(p+m)/2,_=l/d,v=o.range(.9,2.6);e.box(u?_:c,v,u?c:_,o.next()<.3?pd(s,.85):s,h,0,g);let y=u?_/2:c/2,b=u?c/2:_/2;t.addBox(h-y,g-b,h+y,g+b,v,`wood`)}for(let[t,o]of[[n,r],[i,a]])e.box(.22,2.7,.22,J.wood,t,0,o)}for(let t=0;t<3;t++)e.put(new mi(1.6,.06,.22),s,n+o.range(-i/3,i/3),.12,r+o.range(-a/3,a/3),0,o.range(0,Math.PI),o.range(-.15,.15))}function Md(e,t,n,r,i,a,o,s){let c=Math.abs(i-n)>Math.abs(a-r),l=Math.abs(c?i-n:a-r),u=Math.max(1,Math.round(l/2.5)),d=[J.rustLight,J.orange,J.rust,J.sandDark,J.rockLight];for(let t=0;t<u;t++){let f=(t+.5)/u,p=n+(i-n)*f+(c?0:s.range(-.4,.4)),m=r+(a-r)*f+(c?s.range(-.4,.4):0),h=l/u+s.range(.4,1.4),g=s.range(2.2,3.4),_=o*s.range(.75,1.25),v=0,y=s.int(0,d.length);for(;v<_;){let t=Math.min(_-v,s.range(.5,1.2)),n=1-v/Math.max(_,1)*.2;e.box((c?h:g)*n,t,(c?g:h)*n,d[y%d.length],p,v,m,s.range(-.05,.05)),v+=t,y++}}let f=1.2;t.addBox(Math.min(n,i)-(c?0:f),Math.min(r,a)-(c?f:0),Math.max(n,i)+(c?0:f),Math.max(r,a)+(c?f:0),o,`rock`)}var Nd=class{pos;wind;area;radius;object=new U;ball=new U;bounce=Math.random()*10;constructor(e,t,n,r=.45){this.pos=e,this.wind=t,this.area=n,this.radius=r;for(let[e,t,n]of[[1,J.woodPale,[0,0,0]],[.75,J.sandDark,[.12,.08,-.1]],[.65,J.wood,[-.1,-.05,.12]]])Y(new bi(r*e,0),t,n[0]*r,n[1]*r,n[2]*r,this.ball).rotation.set(Math.random()*3,Math.random()*3,0);this.object.add(this.ball),this.object.position.copy(e)}update(e){let t=this.wind.length()*(.75+.25*Math.sin(this.bounce*.7)),n=this.wind.clone().normalize();this.pos.x+=n.x*t*e,this.pos.z+=n.y*t*e;let r=this.area;this.pos.x>r.maxX&&(this.pos.x=r.minX),this.pos.x<r.minX&&(this.pos.x=r.maxX),this.pos.z>r.maxZ&&(this.pos.z=r.minZ),this.pos.z<r.minZ&&(this.pos.z=r.maxZ),this.bounce+=e*3.2;let i=Math.abs(Math.sin(this.bounce))*.35;this.object.position.set(this.pos.x,this.radius*.8+i,this.pos.z);let a=new V(n.y,0,-n.x);this.ball.rotateOnWorldAxis(a,t*e/this.radius)}};function Pd(){let e=new bl(4242),t=new U,n=new ad,r=new sd(60);t.add(md((e,t,n)=>{let r=xl(e*.08,t*.08,11)*.7+xl(e*.25,t*.25,5)*.3,i=r<.32?J.sandDark:r<.66?J.sand:J.sandLight,a=n.next();return a<.02&&(i=J.sandPale),Math.abs(t-e*.3-2)<1.6&&Math.abs(Math.abs(t-e*.3-2)-.9)<.35&&a<.7&&(i=9333830),i})),kd(n,r,-3,-4,.5,`broken`),gd(n,r,4,-8,12,-8),gd(n,r,12,-8,12,-2);for(let[t,i]of[[-10,-9],[7,4],[-6,7],[15,-14],[-15,3],[2,-15],[18,6],[-18,-12]])Cd(n,r,t,i,e);for(let[t,i]of[[-12,-3],[10,9],[0,12],[-20,10],[20,-6]])wd(n,r,t,i,e);for(let t=0;t<26;t++)Td(n,e.range(-26,26),e.range(-26,26),e);Ed(n,e,30),t.add(n.build());let i={minX:-30,maxX:30,minZ:-30,maxZ:30},a=new B(1.6,.7),o=[new V(-14,0,-2),new V(-4,0,6),new V(6,0,-10)].map((e,t)=>new Nd(e,a.clone().multiplyScalar(.8+t*.25),i,.4+t*.07));for(let e of o)t.add(e.object);return{group:t,tumbleweeds:o}}var Fd=class{engine;scene=new gn;tumbleweeds;list;dialog=null;time=0;focus=new V;constructor(e,t){this.engine=e;let n=q.render;this.scene.background=new W(n.skyColor),this.scene.add(new aa(n.skyLightColor,n.groundLightColor,n.hemiIntensity));let r=new Sa(n.sunColor,n.sunIntensity);r.castShadow=!0,r.shadow.mapSize.set(2048,2048),Object.assign(r.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:200}),r.shadow.bias=-5e-4,r.shadow.normalBias=.02,r.position.set(...n.sunDirection.map(e=>e*80)),this.scene.add(r,r.target);let i=Pd();this.tumbleweeds=i.tumbleweeds,this.scene.add(i.group),e.pixelPass.unoutlined.length=0,e.pixelPass.normalPassExclude.length=0;let a=Ou();this.list=new Gu([{label:`SANDBOX`,description:`Explore the frontier town freely.`,action:()=>t(`sandbox`)},{label:`WAVE`,sub:a>0?`BEST: WAVE ${a}`:void 0,description:`Survive endless waves of outlaws.`,action:()=>t(`wave`)},{label:`STORY`,dim:!0,description:`Coming soon.`,action:()=>{this.dialog=new Ku(`STORY`,`Story mode isn't available yet. Check back in a future update!`,[{label:`OK`,action:()=>this.dialog=null}])}}],110,18,5),e.rig.snapTo(this.focus),e.input.clearPressed()}frame(e){let t=this.engine;this.time+=e,this.focus.set(Math.sin(this.time*.05)*14,0,Math.cos(this.time*.037)*8-2),t.rig.update(e,this.focus,t.pixelate);for(let t of this.tumbleweeds)t.update(e);t.renderer.shadowMap.needsUpdate=!0,t.renderScene(this.scene);let n=t.lowW,r=t.lowH,i=t.hud.clear();qu(i,n,r,.22);let a=t.pointer(),o=Wu(t.input),s=n>=420?4:3,c=q.game.title,l=yu(c,s),u=Math.round(r*.16);vu(i,c,Math.round((n-l)/2),u,$.brassLight,s,$.ink),i.fillStyle=$.rust,i.fillRect(Math.round((n-l)/2),u+6*s,l,1);let d=Math.round((n-this.list.w)/2),f=u+6*s+14;this.dialog?this.dialog.update(n,r,a,o):this.list.update(d,f,a,o),this.list.draw(i);let p=this.list.focused.description??``;Q(i,p.toUpperCase(),Math.round((n-Z(p))/2),f+this.list.height+8,$.cream,$.ink);let m=`W/S SELECT   ENTER START`;Q(i,m,Math.round((n-Z(m))/2),r-10,$.sand,$.ink),this.dialog&&(qu(i,n,r,.4),this.dialog.draw(i,n,r)),Uu(i,a.x,a.y),t.debug.draw(e,t.rig.view,null,[`main menu  geometries ${t.renderer.info.memory.geometries}  textures ${t.renderer.info.memory.textures}`])}dispose(){Xu(this.scene),this.scene.clear()}},Id=class{engine;actions;list;confirm=null;constructor(e,t){this.engine=e,this.actions=t,this.list=new Gu([{label:`RESUME`,action:()=>t.resume()},{label:`RESTART`,action:()=>t.restart()},{label:`MAIN MENU`,action:()=>{this.confirm=new Ku(`MAIN MENU`,`Leave the current game?`,[{label:`LEAVE`,action:()=>t.mainMenu()},{label:`STAY`,action:()=>this.confirm=null}])}}],90,15,4)}reset(){this.list.focus=0,this.confirm=null}frame(){let e=this.engine,t=e.lowW,n=e.lowH,r=e.hud.context,i=e.pointer(),a=Wu(e.input);qu(r,t,n,.5);let o=this.list.w+24,s=this.list.height+30,c=Math.round((t-o)/2),l=Math.round((n-s)/2);if(Iu(r,{x:c,y:l,w:o,h:s},`PAUSED`),this.confirm)this.list.update(c+12,l+18,{...i,pressed:!1,released:!1,moved:!1},{up:!1,down:!1,confirm:!1,back:!1}),this.list.draw(r),this.confirm.update(t,n,i,a),this.confirm&&(qu(r,t,n,.4),this.confirm.draw(r,t,n));else{if(a.back){this.actions.resume();return}this.list.update(c+12,l+18,i,a),this.list.draw(r)}let u=`PAUSED`;vu(r,u,Math.round((t-yu(u,2))/2),l-24,$.cream,2,$.ink),Uu(r,i.x,i.y)}},Ld=class{engine;factories;state=`MainMenu`;mode=null;modeKind=`sandbox`;modeOpts={};menu=null;pauseMenu;gameOverScreen=null;pending=null;constructor(e,t){this.engine=e,this.factories=t,this.pauseMenu=new Id(e,{resume:()=>this.resume(),restart:()=>this.defer(()=>this.startMode(this.modeKind,this.modeOpts)),mainMenu:()=>this.defer(()=>this.toMenu())})}boot(e){let t=e.get(`mode`);if(t===`sandbox`||t===`wave`){let n=Number(e.get(`wave`));this.startMode(t,n>0?{startWave:Math.floor(n)}:{})}else this.toMenu()}defer(e){this.pending=e}teardown(){this.mode?.dispose(),this.mode=null,this.menu?.dispose(),this.menu=null,this.gameOverScreen=null}toMenu(){this.teardown(),this.menu=new Fd(this.engine,e=>this.defer(()=>this.startMode(e,{}))),this.state=`MainMenu`}startMode(e,t){this.teardown(),this.modeKind=e,this.modeOpts=t,this.mode=this.factories[e](this.engine,this,t),this.mode.init(),this.state=`Playing`,this.engine.input.clearPressed()}pause(){this.state===`Playing`&&(this.state=`Paused`,this.pauseMenu.reset(),this.engine.input.clearPressed())}resume(){this.state===`Paused`&&(this.state=`Playing`,this.engine.input.clearPressed())}gameOver(e){let t=ku(e.waveReached);this.gameOverScreen=new Yu(this.engine,e,t,{retry:()=>this.defer(()=>this.startMode(this.modeKind,{})),mainMenu:()=>this.defer(()=>this.toMenu())}),this.state=`GameOver`,this.engine.input.clearPressed()}frame(e){let t=this.engine.input;switch(this.state){case`MainMenu`:this.menu.frame(e);break;case`Playing`:if(t.consume(`Escape`)&&!this.mode.session.escape()){this.pause(),this.mode.render(e),this.pauseMenu.frame();break}this.mode.update(e);break;case`Paused`:this.mode.render(e),this.pauseMenu.frame();break;case`GameOver`:this.mode.render(e),this.gameOverScreen.frame()}if(this.pending){let e=this.pending;this.pending=null,e()}}},Rd=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]],zd=class{half;cell;n;blocked;g;parent;stamp;closed;search=0;constructor(e,t,n=.5,r=.42){this.half=t,this.cell=n,this.n=Math.ceil(t*2/n);let i=this.n*this.n;this.blocked=new Uint8Array(i),this.g=new Float32Array(i),this.parent=new Int32Array(i),this.stamp=new Uint32Array(i),this.closed=new Uint32Array(i);for(let t=0;t<this.n;t++)for(let n=0;n<this.n;n++){let i=this.cx(n),a=this.cx(t),o={x:i,z:a};e.resolveCircle(o,r),Math.abs(o.x-i)+Math.abs(o.z-a)>1e-4&&(this.blocked[t*this.n+n]=1)}}cx(e){return-this.half+(e+.5)*this.cell}ix(e){return Math.max(0,Math.min(this.n-1,Math.floor((e+this.half)/this.cell)))}isFree(e,t){return Math.abs(e)>=this.half||Math.abs(t)>=this.half?!1:!this.blocked[this.ix(t)*this.n+this.ix(e)]}nearestFree(e,t,n=6){if(this.isFree(e,t))return[e,t];let r=this.ix(e),i=this.ix(t),a=Math.ceil(n/this.cell);for(let n=1;n<=a;n++){let a=null,o=1/0;for(let s=-n;s<=n;s++)for(let c=-n;c<=n;c++){if(Math.max(Math.abs(c),Math.abs(s))!==n)continue;let l=r+c,u=i+s;if(l<0||u<0||l>=this.n||u>=this.n||this.blocked[u*this.n+l])continue;let d=this.cx(l),f=this.cx(u),p=(d-e)**2+(f-t)**2;p<o&&(o=p,a=[d,f])}if(a)return a}return null}walkable(e,t,n,r){let i=Math.hypot(n-e,r-t),a=Math.max(1,Math.ceil(i/(this.cell*.5)));for(let i=0;i<=a;i++){let o=i/a;if(!this.isFree(e+(n-e)*o,t+(r-t)*o))return!1}return!0}findPath(e,t,n,r,i=4e4){let a=this.nearestFree(e,t,2),o=this.nearestFree(n,r,6);if(!a||!o)return null;if(this.walkable(e,t,o[0],o[1]))return[o];let s=this.n,c=this.ix(a[1])*s+this.ix(a[0]),l=this.ix(o[1])*s+this.ix(o[0]),u=l%s,d=Math.floor(l/s),f=++this.search,p=new Bd,m=e=>{let t=Math.abs(e%s-u),n=Math.abs(Math.floor(e/s)-d);return Math.max(t,n)+(Math.SQRT2-1)*Math.min(t,n)};this.stamp[c]=f,this.g[c]=0,this.parent[c]=-1,p.push(c,m(c));let h=0,g=!1;for(;p.size>0;){let e=p.pop();if(this.closed[e]===f)continue;if(this.closed[e]=f,e===l){g=!0;break}if(++h>i)break;let t=e%s,n=Math.floor(e/s);for(let[r,i,a]of Rd){let o=t+r,c=n+i;if(o<0||c<0||o>=s||c>=s)continue;let l=c*s+o;if(this.blocked[l]||this.closed[l]===f||r!==0&&i!==0&&(this.blocked[n*s+o]||this.blocked[c*s+t]))continue;let u=this.g[e]+a;(this.stamp[l]!==f||u<this.g[l])&&(this.stamp[l]=f,this.g[l]=u,this.parent[l]=e,p.push(l,u+m(l)))}}if(!g)return null;let _=[];for(let e=l;e!==-1;e=this.parent[e])_.push([this.cx(e%s),this.cx(Math.floor(e/s))]);_.reverse(),_[_.length-1]=o;let v=[],y=e,b=t,x=0;for(;x<_.length;){let e=_.length-1;for(;e>x&&!this.walkable(y,b,_[e][0],_[e][1]);)e--;v.push(_[e]),[y,b]=_[e],x=e+1}return v}},Bd=class{items=[];prio=[];get size(){return this.items.length}push(e,t){let n=this.items,r=this.prio;n.push(e),r.push(t);let i=n.length-1;for(;i>0;){let e=i-1>>1;if(r[e]<=r[i])break;[n[e],n[i]]=[n[i],n[e]],[r[e],r[i]]=[r[i],r[e]],i=e}}pop(){let e=this.items,t=this.prio,n=e[0],r=e.pop(),i=t.pop();if(e.length>0){e[0]=r,t[0]=i;let n=0;for(;;){let r=n*2+1,i=r+1,a=n;if(r<e.length&&t[r]<t[a]&&(a=r),i<e.length&&t[i]<t[a]&&(a=i),a===n)break;[e[a],e[n]]=[e[n],e[a]],[t[a],t[n]]=[t[n],t[a]],n=a}}return n}},Vd=class{root=new U;segs=[];time=0;swishLeft=0;swishDir=1;swishTimer=0;constructor(e){let t=q.horse.tail,n=t.segments,r=t.length/n,i=this.root;for(let t=0;t<n;t++){let a=t/n,o=(t+1)/n,s=e=>ll(.085,.035,e)+Math.max(0,e-.6)*.14,c=new U;c.position.y=t===0?0:-r*.92,i.add(c);let l=new gi(s(a),s(o),r,5);l.translate(0,-r/2,0);let u=Y(l,e,0,0,0,c);a>=.4&&u.scale.set(1.25+a*.4,1,.75),this.segs.push({pivot:c,pitch:.15,side:0,vPitch:0,vSide:0}),i=c}this.swishTimer=this.nextSwish(),this.apply()}nextSwish(){let[e,t]=q.horse.tail.swishInterval;return e+Math.random()*(t-e)}update(e,t){if(e<=0)return;let n=q.horse.tail;this.time+=e;let r=t.speed01,i=sl((r-.45)/.35,0,1),a=r>.03;this.swishTimer-=e,this.swishTimer<=0&&!a&&(this.swishLeft=.45,this.swishDir=Math.random()<.5?-1:1,this.swishTimer=this.nextSwish()),this.swishLeft=Math.max(0,this.swishLeft-e);let o=this.swishLeft>0?Math.sin((1-this.swishLeft/.45)*Math.PI)*.75*this.swishDir:0,s=ll(.18,.32,Math.min(1,r*2))+i*.95;s+=sl(t.accel*.05,-.9,.5),t.braking&&(s-=.35);let c=o;a&&(c+=Math.sin(t.gaitPhase*Math.PI*2)*.14*(1-i)),c+=sl(-t.turnRate*(.18+r*.25),-.8,.8),t.pivoting&&(c+=Math.sin(this.time*9)*.35),s=sl(s,-.6,1.4);let l=Math.max(1,Math.ceil(e/(1/120))),u=e/l;for(let e=0;e<l;e++)this.segs.forEach((e,t)=>{let r=t===0?null:this.segs[t-1],a=t===0?n.stiffness:n.followStiffness*.85**(t-1),o=t===0?0:.04*i,l=r?r.pitch+o:s,d=r?r.side:c,f=t>1?Math.sin(this.time*19+t*1.7)*.06*i:0;e.vPitch+=(a*(l+f-e.pitch)-n.damping*e.vPitch)*u,e.vSide+=(a*(d+f*.7-e.side)-n.damping*e.vSide)*u,e.pitch+=e.vPitch*u,e.side+=e.vSide*u});this.apply()}apply(){let e=0,t=0;for(let n of this.segs)n.pivot.rotation.set(n.pitch-e,0,n.side-t,`XZY`),e=n.pitch,t=n.side}get rootPitch(){return this.segs[0].pitch}get tipPitch(){return this.segs[this.segs.length-1].pitch}get tipSide(){return this.segs[this.segs.length-1].side}},Hd=1.02,Ud=-.72,Wd=.72,Gd=[0,.5,.75,.25],Kd=[0,.12,.55,.67],qd=(Kd[0]+Kd[1])/2;function Jd(e,t,n,r=8,i=6){let a=new Ci(1,r,i);return a.scale(e,t,n),a}function Yd(e,t,n,r=0,i=7){let a=new gi(e,t,n,i);return r!==0&&a.translate(0,-r*n/2,0),a}function Xd(e,t,n,r=!1){let i=new gi(e,t,n,8,1,r);return i.rotateX(Math.PI/2),i}function Zd(e,t){let n=new hi(e,t,3,8);return n.rotateX(Math.PI/2),n}var Qd=class{root=new U;saddle=new U;pitchPivot=new U;body=new U;neck=new U;head=new U;tail=new Vd(J.ink);prevSpeed=0;legs=[];phase=0;time=0;rear=0;rearHold=0;lean=0;onFootfall=null;constructor(){let e=J.woodLight,t=J.darkBrown;this.root.add(this.pitchPivot),this.pitchPivot.position.set(0,Hd,Ud),this.pitchPivot.add(this.body),this.body.position.set(0,-1.02,.72);let n=this.body;Y(Zd(.34,1),e,0,1.36,0,n).scale.set(.95,1.08,1),Y(Jd(.36,.39,.42),e,0,1.45,-.66,n),Y(Jd(.32,.39,.36),e,0,1.41,.66,n),Y(Jd(.27,.1,.55),J.wood,0,1.02,0,n),this.neck.position.set(0,1.6,.92),n.add(this.neck);let r=Y(Yd(.14,.24,.95,-1),e,0,0,0,this.neck);r.scale.set(.8,1,1.15),r.rotation.x=.62;let i=Y(X(.07,.9,.12,-1),J.ink,0,.05,-.2,this.neck);i.rotation.x=.62;let a=this.head;a.position.set(0,.78,.5),this.neck.add(a),Y(Jd(.15,.17,.18),e,0,0,-.02,a);let o=Y(Xd(.1,.15,.62),e,0,-.05,.18,a);o.scale.x=.85,o.rotation.x=.3,Y(Jd(.09,.075,.06),J.ink,0,-.14,.46,a),Y(X(.06,.03,.3),J.cream,0,.03,.3,a).rotation.x=.3;for(let t of[-1,1])Y(new _i(.045,.16,4),e,t*.08,.19,-.1,a),Y(X(.03,.04,.05),J.ink,t*.135,.04,.04,a);let s=Y(Xd(.125,.125,.04,!0),J.brown,0,-.094,.323,a);s.scale.x=.85,s.rotation.x=.3,this.tail.root.position.set(0,1.7,-1.02),n.add(this.tail.root),Y(X(.72,.06,.8),J.red,0,1.71,-.05,n),Y(X(.74,.05,.82),J.cream,0,1.69,-.05,n),Y(X(.5,.14,.62),J.brown,0,1.78,-.08,n),Y(X(.12,.14,.12),J.darkBrown,0,1.9,.18,n),Y(X(.46,.12,.08),J.darkBrown,0,1.88,-.36,n),this.saddle.position.set(0,1.84-.88,-.08),n.add(this.saddle);for(let[r,i,a]of[[.2,Wd,!0],[-.2,Wd,!0],[.2,Ud,!1],[-.2,Ud,!1]]){let o=new U;o.position.set(r,1.12,i),n.add(o),a?Y(Yd(.12,.085,.55,1),e,0,0,0,o):Y(Yd(.16,.085,.62,1),e,0,.08,-.04,o).scale.z=1.45;let s=new U;s.position.set(0,-.52,0),o.add(s),Y(Yd(.07,.055,.48,1),t,0,0,0,s),Y(Jd(.07,.06,.075),t,0,-.4,.01,s),Y(Yd(.07,.09,.09,1),J.ink,0,-.45,.01,s),this.legs.push({hip:o,knee:s,front:a})}}animate(e,t){this.time+=e;let n=sl(t.speed/t.gallopSpeed,0,1),r=t.pivoting?Math.min(1,Math.abs(t.angularVelocity)*.5):0,i=Math.max(n,r*.35),a=i>.01,o=this.phase;a&&(this.phase+=e*ll(1.2,2.4,n)*(t.pivoting&&n<.05?.8:1));let s=n>.4?2:1;this.onFootfall&&n>.3&&Math.floor(o*s)!==Math.floor(this.phase*s)&&this.onFootfall(0,-.7);let c=sl((n-.35)/.4,0,1),l=a?ll(.25,.85,i):0;this.legs.forEach((t,n)=>{let r=ll(Gd[n],Kd[n],c),i=(this.phase+r)*Math.PI*2,a=Math.sin(i)*l*(t.front?1:.85),o=Math.max(0,Math.cos(i))*l*(t.front?1.3:-1.1);t.front&&this.rear>.01&&(a=ll(a,1.1+Math.sin(this.time*16+n)*.15,this.rear),o=ll(o,1.6,this.rear)),t.hip.rotation.x=pl(t.hip.rotation.x,-a,30,e),t.knee.rotation.x=pl(t.knee.rotation.x,o,30,e)});let u=ll(.015,.1,i),d=a?Math.abs(Math.sin(this.phase*Math.PI*2))*u:Math.sin(this.time*1.6)*.01,f=a?Math.sin(this.phase*Math.PI*2)*.05*c:0;t.braking&&n>.45&&(this.rearHold=.45),this.rearHold=Math.max(0,this.rearHold-e),this.rear=pl(this.rear,+(this.rearHold>0),this.rearHold>0?8:4,e),this.pitchPivot.position.y=Hd+d,this.pitchPivot.rotation.x=f-this.rear*.5;let p=sl(-t.angularVelocity*t.speed*.022,-.28,.28);this.lean=pl(this.lean,p,6,e),this.root.rotation.z=this.lean;let m=a?Math.sin((this.phase+qd)*Math.PI*2)*c:0,h=a?Math.sin(this.phase*Math.PI*4)*.06*(1-c):Math.sin(this.time*.7)*.05;this.neck.rotation.x=ll(.05,.35,n)*(1-this.rear)-this.rear*.35+h-m*.22,this.neck.position.z=.92-m*.05,this.head.rotation.x=m*.08;let g=e>0?(t.speed-this.prevSpeed)/e:0;this.prevSpeed=t.speed,this.tail.update(e,{speed01:n,accel:g,turnRate:t.angularVelocity,pivoting:t.pivoting,braking:t.braking,gaitPhase:this.phase})}},$d=class{tuning;heading=0;speed=0;mode=`idle`;angularVelocity=0;delta=0;turnIntensity=0;target=null;constructor(e){this.tuning=e}turnRate(){let e=this.tuning;return ll(e.turnRateSlow,e.turnRateGallop,cl(this.speed/e.gallopSpeed))}minTurnRadius(){return this.speed>.001?this.speed/this.turnRate():1/0}currentTurnRadius(){return Math.abs(this.angularVelocity)>.001?this.speed/Math.abs(this.angularVelocity):1/0}update(e,t,n){let r=this.tuning;if(this.target=e,this.angularVelocity=0,this.turnIntensity=0,e===null){this.delta=0,this.mode=this.speed>0?`coasting`:`idle`,this.speed=Math.max(0,this.speed-this.coastDecel()*n),this.speed<r.stopEpsilon&&(this.speed=0);return}let i=dl(e-this.heading),a=Math.abs(i);this.delta=i;let o=t?r.gallopSpeed:r.canterSpeed;if(a>r.brakeAngle&&this.speed>r.pivotSpeed){this.mode=`braking`,this.speed=Math.max(0,this.speed-r.brakeDecel*n);return}if(this.speed<=r.pivotSpeed&&a>r.pivotAlignAngle){this.mode=`pivoting`;let e=Math.sign(i)*Math.min(a,r.pivotTurnRate*n);this.heading=dl(this.heading+e),this.angularVelocity=e/n,this.turnIntensity=1,this.speed=Math.max(0,this.speed-r.brakeDecel*n),this.speed<r.stopEpsilon&&(this.speed=0);return}this.mode=`moving`;let s=this.turnRate()*n,c=Math.max(-s,Math.min(s,i));if(this.heading=dl(this.heading+c),this.angularVelocity=c/n,this.turnIntensity=s>0?Math.abs(c)/s:0,this.speed-=this.speed*r.turnSpeedLoss*this.turnIntensity*n,this.speed<o){let e=ll(.45,1,ul(0,.25*r.gallopSpeed,this.speed)),t=Math.max(.3,1-this.speed/o),i=r.acceleration*e*t*(1-.6*this.turnIntensity);this.speed=Math.min(o,this.speed+i*n)}else this.speed=Math.max(o,this.speed-this.coastDecel()*n)}coastDecel(){let e=this.tuning;return e.decay*(.35+.65*cl(this.speed/e.gallopSpeed))}applyCollision(e,t,n){if(this.speed<=0)return;let r=Math.sin(this.heading),i=Math.cos(this.heading),a=r*e+i*t;if(a>=0)return;let o=-a,s=r-a*e,c=i-a*t,l=Math.hypot(s,c),u=1-n*(1-Math.sqrt(Math.max(0,1-o*o)));l<.001||o>.995?this.speed=0:(this.heading=Math.atan2(s/l,c/l),this.speed*=u)}},ef=class{label=`Mount horse`;range=q.player.mountRange;priority=0;promptHeight=2.6;canMount=()=>!this.ridden;onMount=()=>{};motor=new $d(q.horse);model=new Qd;pos=new V;prevPos=new V;prevHeading=0;ridden=!1;riderNpc=null;driver=null;renderYaw=0;lastContact=!1;get position(){return this.pos}canInteract(){return this.canMount()}interact(){this.onMount()}get heading(){return this.motor.heading}place(e,t){this.pos.copy(e),this.prevPos.copy(e),this.motor.heading=this.prevHeading=this.renderYaw=t,this.motor.speed=0}update(e,t,n,r,i){this.prevPos.copy(this.pos),this.prevHeading=this.motor.heading,this.motor.update(t,n,e);let a=this.motor;this.pos.x+=Math.sin(a.heading)*a.speed*e,this.pos.z+=Math.cos(a.heading)*a.speed*e;let o={x:this.pos.x,z:this.pos.z},s=r.resolveCircle(o,q.horse.radius,i);this.pos.x=o.x,this.pos.z=o.z,this.lastContact=s.hit,s.hit&&a.applyCollision(s.nx,s.nz,q.horse.collisionSpeedLoss)}sync(e,t){this.model.root.position.lerpVectors(this.prevPos,this.pos,e);let n=hl(this.prevHeading,this.motor.heading,e);this.renderYaw=hl(this.renderYaw,n,1-Math.exp(-25*t)),this.model.root.rotation.y=this.renderYaw;let r=this.motor;this.model.animate(t,{speed:r.speed,gallopSpeed:q.horse.gallopSpeed,angularVelocity:r.angularVelocity,braking:r.mode===`braking`,pivoting:r.mode===`pivoting`,ridden:this.ridden})}get renderYawValue(){return this.renderYaw}},tf=class{group=new U;light=new ya(16762992,0,4.5,1.6);timer=0;duration=.06;constructor(){let e=new Sr({color:J.white}),t=new Sr({color:J.brassLight}),n=new Pr(new xi(.16),e),r=new Pr(new mi(.08,.08,.55),t);r.position.z=.22;let i=new Pr(new mi(.4,.06,.06),t);i.position.z=.08,this.group.add(n,r,i),this.group.visible=!1}trigger(e,t){this.timer=this.duration,this.group.position.copy(e),this.group.lookAt(e.x+t.x,e.y+t.y,e.z+t.z),this.group.rotateZ(Math.random()*Math.PI),this.group.scale.setScalar(.85+Math.random()*.4),this.group.visible=!0,this.light.position.copy(e).addScaledVector(t,.3)}update(e){this.timer=Math.max(0,this.timer-e),this.group.visible=this.timer>0,this.light.intensity=this.timer>0?14*(this.timer/this.duration):0}},nf=[{id:`porch-gunman`,attitude:`friendly`,defendsOthers:!0,appearance:{body:`male`,skin:J.skin,hair:J.darkBrown,hairStyle:`short`,beard:J.brown,clothing:{hat:`cowboy_hat_tan`,top:`shirt_cream`,outerwear:`vest_brown`,legs:`trousers_denim`,boots:`boots_brown`,belt:`belt_leather`,holster:`holster_leather`}},weapon:`revolver`,spawn:[.45,-4.25],routine:{kind:`lean`,at:[.45,-4.25],facing:0}},{id:`townswoman`,attitude:`friendly`,defendsOthers:!1,appearance:{body:`female`,skin:J.skin,hair:J.woodLight,hairStyle:`bun`,clothing:{hat:`bonnet_cream`,legs:`dress_blue`,boots:`boots_brown`}},weapon:null,spawn:[4,-3.2],routine:{kind:`wander`,points:[[-14,-3.6],[-5,-3.4],[3.5,-3.4],[12,-3.6],[20,-3.6],[-16.4,-10],[-16.4,-1],[-15.6,4.6]],jitter:1.2,pause:[2,6],inspect:.3}},{id:`fence-rifle`,attitude:`neutral`,defendsOthers:!1,appearance:{body:`female`,skin:J.skinDark,hair:J.ink,hairStyle:`long`,clothing:{hat:`cowboy_hat_dark`,top:`shirt_rust`,outerwear:`duster_sand`,legs:`trousers_brown`,boots:`boots_black`}},weapon:`rifle`,spawn:[-10,10.6],routine:{kind:`wander`,points:[[-13,10.6],[-8.5,10.6],[-10,7.6],[10.5,10.6],[15,10.6],[18,7.6],[12,7.6]],jitter:.6,pause:[3,7],inspect:.45}},{id:`edge-patrol`,attitude:`neutral`,defendsOthers:!1,appearance:{body:`male`,skin:J.skin,hair:J.ink,hairStyle:`short`,beard:J.ink,clothing:{hat:`cowboy_hat_black`,top:`shirt_denim`,neck:`bandana_red`,legs:`chaps_wood`,boots:`boots_brown`}},weapon:`shotgun`,spawn:[44,14],routine:{kind:`patrol`,points:[[44,44],[-44,44],[-44,-44],[44,-44]],pause:2}},{id:`gunsmith`,attitude:`friendly`,defendsOthers:!1,shop:`gunsmith`,appearance:{body:`male`,skin:J.skin,hair:J.brown,hairStyle:`short`,beard:J.brown,clothing:{hat:`cowboy_hat_brown`,top:`shirt_grey`,outerwear:`vest_brown`,legs:`trousers_brown`,boots:`boots_black`,belt:`belt_leather`}},weapon:null,spawn:[15.55,-4.25],routine:{kind:`lean`,at:[15.55,-4.25],facing:0},lines:{greet:[`Looking for iron?`,`Finest guns this side of the Pecos.`]}},{id:`tailor`,attitude:`friendly`,defendsOthers:!1,shop:`tailor`,appearance:{body:`female`,skin:J.skin,hair:J.darkBrown,hairStyle:`bun`,clothing:{legs:`dress_red`,boots:`boots_black`}},weapon:null,spawn:[-16.9,9.2],routine:{kind:`idle`,at:[-16.9,9.2],facing:Math.PI/2},lines:{greet:[`That coat has seen better days.`,`Something finer, perhaps?`]}}],rf={hostile:{greet:[`...`],warn:[`Ha!`],hostile:[`There he is!`,`Get him, boys!`,`Your hide's worth money!`,`End of the line.`],flee:[`I'm out! Fall back!`],calm:[`...`]},friendly:{greet:[`Howdy, stranger!`,`Fine day, ain't it?`,`Mind the sun out here.`,`Welcome to town, friend.`],warn:[`Hey! Watch where you point that!`,`Easy with that iron!`,`You near hit me!`],hostile:[`You asked for it!`,`That's it, draw!`],flee:[`Help! Somebody help!`,`Don't shoot!`],calm:[`Reckon that's over.`]},neutral:{greet:[`What do you want?`,`Keep walking.`,`Hm.`,`Mind your business.`],warn:[`Careful, stranger.`,`Do that again, I dare you.`,`Watch it!`],hostile:[`Big mistake.`,`Now you've done it.`],flee:[`Leave me be!`,`Not worth dying over!`],calm:[`Hmph. Gone.`]}},af={male:[`Jed`,`Eli`,`Wade`,`Cole`,`Silas`,`Amos`,`Hank`,`Virgil`,`Clay`,`Ezra`],female:[`Clara`,`Mae`,`Hattie`,`Ruth`,`Etta`,`Lottie`,`Ada`,`Josie`,`Pearl`,`Nell`],last:[`Collins`,`Harlan`,`McCready`,`Sutter`,`Boone`,`Calloway`,`Pickett`,`Hollis`,`Tate`,`Whitlock`]},of=[`hat`,`neck`,`top`,`outerwear`,`legs`,`belt`,`holster`,`boots`],sf=e=>`w${e}`,cf=e=>e.startsWith(`w`)?Number(e.slice(1)):-1,lf=class{weapons=[,,,].fill(null);clothing=Object.fromEntries(of.map(e=>[e,null]));version=0;get(e){let t=cf(e);return t>=0?this.weapons[t]??null:this.clothing[e]}accepts(e,t){let n=zl(t.defId),r=cf(e);if(r>=0)return r<3&&n.category===`weapon`;let i=Vl(n);return i?i.slot===e||i.slot===`fullBody`&&e===`legs`:!1}get dress(){let e=this.clothing.legs;return e&&Vl(zl(e.defId))?.slot===`fullBody`?e:null}put(e,t,n){if(!this.accepts(e,t)||this.get(e))return!1;let r=cf(e);if(r>=0)return this.weapons[r]=t,this.version++,!0;let i=[];if(Vl(zl(t.defId))?.slot===`fullBody`&&this.clothing.top&&i.push([`top`,this.clothing.top]),e===`top`&&this.dress&&i.push([`legs`,this.dress]),i.length>0){if(!n)return!1;let e=[];for(let[,t]of i){if(!n.placeAnywhere(t)){for(let t of e)n.remove(t);return!1}e.push(t)}for(let[e]of i)this.clothing[e]=null}return this.clothing[e]=t,this.version++,!0}take(e){let t=this.get(e);if(!t)return null;let n=cf(e);return n>=0?this.weapons[n]=null:this.clothing[e]=null,this.version++,t}snapshot(){let e=[...this.weapons],t={...this.clothing},n=this.version;return()=>{this.weapons.splice(0,this.weapons.length,...e),Object.assign(this.clothing,t),this.version=n}}slotOf(e){let t=this.weapons.indexOf(e);return t>=0?sf(t):of.find(t=>this.clothing[t]===e)??null}weaponDefs(){return this.weapons.map(e=>e?Bl(zl(e.defId)):null)}appearance(e){let t={};for(let e of of){let n=this.clothing[e];n&&(t[e]=Vl(zl(n.defId)).id)}return{...e,clothing:t}}},uf=class{w;h;placements=[];constructor(e,t){this.w=e,this.h=t}get items(){return this.placements.map(e=>e.item)}get isEmpty(){return this.placements.length===0}find(e){return this.placements.find(t=>t.item===e)}at(e,t){return this.placements.find(n=>{let r=Nu(n.item);return e>=n.x&&e<n.x+r.w&&t>=n.y&&t<n.y+r.h})}overlapping(e,t,n,r,i){return this.placements.filter(a=>{if(a.item===i)return!1;let o=Nu(a.item);return e<a.x+o.w&&e+n>a.x&&t<a.y+o.h&&t+r>a.y})}inBounds(e,t,n,r){return e>=0&&t>=0&&e+n<=this.w&&t+r<=this.h}fits(e,t,n,r=e.rotated,i){let a=Nu(e,r);return this.inBounds(t,n,a.w,a.h)&&this.overlapping(t,n,a.w,a.h,i).length===0}place(e,t,n,r=e.rotated){return this.find(e)||!this.fits(e,t,n,r)?!1:(e.rotated=r,this.placements.push({item:e,x:t,y:n}),!0)}remove(e){let t=this.placements.findIndex(t=>t.item===e);return t<0?!1:(this.placements.splice(t,1),!0)}move(e,t,n,r=e.rotated){let i=this.find(e);return!i||!this.fits(e,t,n,r,e)?!1:(i.x=t,i.y=n,e.rotated=r,!0)}findFree(e){let t=[e.rotated,!e.rotated],{w:n,h:r}=zl(e.defId).size;n===r&&t.pop();for(let n of t)for(let t=0;t<this.h;t++)for(let r=0;r<this.w;r++)if(this.fits(e,r,t,n))return{x:r,y:t,rotated:n};return null}placeAnywhere(e){let t=this.findFree(e);return t?this.place(e,t.x,t.y,t.rotated):!1}add(e){if(zl(e.defId).stackable){for(let t of this.placements){if(e.quantity<=0)break;t.item.defId===e.defId&&t.item!==e&&df(e,t.item)}if(e.quantity<=0)return 0}return this.placeAnywhere(e)?0:e.quantity}snapshot(){let e=this.placements.map(e=>({...e,rotated:e.item.rotated,quantity:e.item.quantity}));return()=>{this.placements.length=0;for(let t of e)t.item.rotated=t.rotated,t.item.quantity=t.quantity,this.placements.push({item:t.item,x:t.x,y:t.y})}}ammoCount(e){let t=0;for(let n of this.placements)zl(n.item.defId).ammoType===e&&(t+=n.item.quantity);return t}takeAmmo(e,t){let n=this.placements.filter(t=>zl(t.item.defId).ammoType===e).sort((e,t)=>e.item.quantity-t.item.quantity),r=0;for(let e of n){if(r>=t)break;let n=Math.min(t-r,e.item.quantity);e.item.quantity-=n,r+=n,e.item.quantity<=0&&this.remove(e.item)}return r}};function df(e,t){if(e.defId!==t.defId||e===t)return 0;let n=zl(e.defId);if(!n.stackable)return 0;let r=Math.max(0,Math.min(e.quantity,n.maxStack-t.quantity));return e.quantity-=r,t.quantity+=r,r}function ff(e){if(!zl(e.defId).stackable||e.quantity<2)return null;let t=Math.floor(e.quantity/2);return e.quantity-=t,{uid:ju(),defId:e.defId,quantity:t,rotated:e.rotated}}var pf=[.55,1.4],mf=1.38,hf=.8,gf=new WeakMap;function _f(e){let t=gf.get(e);if(t)return t;t=[];for(let n of e.colliders){if(!n.blocksBullets||(n.base??0)>0||n.coverHeight<pf[0]||n.coverHeight>pf[1])continue;if(n.kind===`circle`){t.push({x:n.x,z:n.z,ex:n.r,ez:n.r});continue}let e=(n.maxX-n.minX)/2,r=(n.maxZ-n.minZ)/2,i=(n.minX+n.maxX)/2,a=(n.minZ+n.maxZ)/2,o=e>=r?`x`:`z`,s=Math.max(e,r),c=Math.max(1,Math.round(s*2/1.2)),l=s/c;for(let n=0;n<c;n++){let c=-s+l*(2*n+1);t.push(o===`x`?{x:i+c,z:a,ex:l,ez:r}:{x:i,z:a+c,ex:e,ez:l})}}return gf.set(e,t),t}function vf(e,t,n,r=1.2){let[i,a]=t;return e.raycast(n.x,mf,n.z,i,hf,a)?e.raycast(i,mf,a,n.x,r,n.z)===null:!1}function yf(e,t,n){let[r,i]=n.from,{threat:a}=n,o=(n.range[0]+n.range[1])/2,s=null,c=1/0;for(let l of _f(e)){if(Math.hypot(l.x-r,l.z-i)>n.maxTravel+1.5)continue;let u=l.x-a.x,d=l.z-a.z,f=Math.hypot(u,d);if(f<.01)continue;u/=f,d/=f;let p=Math.abs(u)*l.ex+Math.abs(d)*l.ez,m=null;for(let e of[.5,.7]){let n=[l.x+u*(p+e),l.z+d*(p+e)];if(t.isFree(n[0],n[1])){m=n;break}}if(!m)continue;let h=Math.hypot(m[0]-a.x,m[1]-a.z);if(h<n.range[0]||h>n.range[1])continue;let g=Math.hypot(m[0]-r,m[1]-i);if(g>n.maxTravel||n.avoid?.some(([e,t])=>Math.hypot(e-m[0],t-m[1])<1.2))continue;let _=g+Math.abs(h-o)*.3;_>=c||vf(e,m,a)&&(c=_,s=m)}return s}var bf=class{rig;weapon=null;phase=0;time=0;hipsYaw=0;upperYaw=0;stride=0;run=0;fall=0;crouch=0;fallAxis=new V;constructor(e,t){this.rig=new lu(e),this.setWeapon(t)}get root(){return this.rig.root}setWeapon(e){this.weapon=e,this.rig.setWeapons([e]),this.rig.placeWeapons(0,!1,!0)}get longGun(){return this.weapon?.look.kind===`longgun`}get alwaysInHand(){return this.weapon?.look.kind===`pistol`&&!this.rig.hasHolster}animate(e,t){this.time+=e;let n=t.speed>.3&&!t.dead,r=t.draw>.5,{hips:i,upper:a,head:o,armL:s,armR:c}=this.rig;this.rig.placeWeapons(0,t.draw>.5,!0);let l=n?t.moveYaw:this.hipsYaw;if(n)r&&Math.abs(fl(t.moveYaw,t.lookYaw))>1.9&&(l=t.moveYaw+Math.PI);else{let e=fl(this.hipsYaw,t.lookYaw);Math.abs(e)>(r?.9:1.2)&&(l=t.lookYaw-Math.sign(e)*.5)}(t.lean||t.cower)&&(l=this.hipsYaw),this.hipsYaw=t.mounted?0:ml(this.hipsYaw,l,10,e);let u=r?Math.PI:1.1,d=this.hipsYaw+sl(fl(this.hipsYaw,t.lookYaw),-u,u);this.upperYaw=ml(this.upperYaw,d,r?18:6,e),i.rotation.y=this.hipsYaw,a.rotation.y=this.upperYaw,o.rotation.y=pl(o.rotation.y,sl(fl(this.upperYaw,t.lookYaw),-.8,.8),8,e);let f=t.speed>3.2;n&&(this.phase+=e*t.speed*(f?1.9:2.4)),this.stride=pl(this.stride,n?sl(t.speed/4.3,.3,1):0,8,e),this.run=pl(this.run,+!!f,6,e),this.crouch=Math.max(t.crouch,pl(this.crouch,t.flinch*.35,6,e));let p=Math.sin(this.phase)*this.stride*.85,m=this.rig.poseLegs(tu({phase:this.phase,stride:this.stride,run:this.run,crouch:this.crouch,time:this.time,buckle:this.fall>0?this.buckle:0,mounted:t.mounted,crossed:t.lean}),e,16);this.rig.poseSkirt(this.crouch,p),this.rig.placePelvis(t.mounted?.88:m,t.mounted?0:this.crouch);let h=n?f?.14:.04:0;t.lean&&(h=-.16);let g=t.mounted?0:iu*this.crouch;h+=t.flinch*.3+g-t.recoil*.1,a.rotation.x=pl(a.rotation.x,h,12,e);let _={x:-p*.7,y:0,z:.06},v={..._},y={x:p*.7,y:0,z:-.06};if(t.lean&&(v={x:-1.15,y:0,z:-.95},y={x:-1,y:0,z:.95}),this.alwaysInHand&&t.draw<=.5&&(v={x:_.x*.4,y:0,z:.1}),t.draw>0){let e=this.longGun?{x:-2.7,y:0,z:.35}:this.alwaysInHand?_:{x:.3,y:0,z:.12},n=this.longGun?{x:-Math.PI/2+.08-g,y:-.25,z:0}:{x:-Math.PI/2-t.recoil*.5-g,y:-.12,z:0},r=t.draw;v=r<.5?xf(v,e,r*2):xf(e,n,(r-.5)*2),this.longGun&&r>.5&&(y=xf(y,{x:-Math.PI/2+.15-g,y:.55,z:0},(r-.5)*2))}if(t.reload>=0){let e=Math.sin(Math.min(1,t.reload)*Math.PI);v={x:-.7-.4*e,y:0,z:.4*e},y={x:-.9,y:.3,z:-.3}}t.talking&&!r&&(y={x:-.7+Math.sin(this.time*5)*.25,y:0,z:-.25}),t.inspect&&!r&&(v={x:-(.75+g)+Math.sin(this.time*2.3)*.12,y:0,z:.12+Math.sin(this.time*1.7)*.08},y={x:-(.35+g),y:0,z:-.25});let b=Math.max(t.flinch,t.cower?this.crouch:0);b>.01&&!r&&(v=xf(v,{x:-2.6,y:0,z:-.5},b),y=xf(y,{x:-2.6,y:0,z:.5},b));let x=t.draw>0&&t.draw<1?22:14;c.rotation.set(pl(c.rotation.x,v.x,x,e),pl(c.rotation.y,v.y,x,e),pl(c.rotation.z,v.z,x,e)),s.rotation.set(pl(s.rotation.x,y.x,14,e),pl(s.rotation.y,y.y,14,e),pl(s.rotation.z,y.z,14,e)),o.rotation.x=t.flinch*.3-t.recoil*.08+(t.lean?.12:0)-g*(t.inspect?.2:.8),this.fall=gl(this.fall,+!!t.dead,e*(t.dead?1.6:6));let S=ul(.3,1,this.fall)**2;this.rig.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw),0,-Math.sin(this.upperYaw)),-S*1.5),this.rig.body.position.y=S*.14}get buckle(){return this.fall<.6?ul(0,.35,this.fall):ll(1,.35,(this.fall-.6)/.4)}face(e){this.hipsYaw=this.upperYaw=e}};function xf(e,t,n){let r=sl(n,0,1);return{x:ll(e.x,t.x,r),y:ll(e.y,t.y,r),z:ll(e.z,t.z,r)}}function Sf(e,t){if(t<=e.falloffStart)return 1;let n=sl((t-e.falloffStart)/Math.max(1e-6,e.range-e.falloffStart),0,1);return 1+(e.falloffMin-1)*n}function Cf(e,t=Math.random){if(typeof e.pellets==`number`)return e.pellets;let[n,r]=e.pellets;return n+Math.floor(t()*(r-n+1))}function wf(e,t,n,r,i,a,o=Math.random){let s=t.clone(),c=Math.hypot(s.x-e.x,s.z-e.z),l=c*Math.tan(n)*(1+c*r),u=o()*Math.PI*2,d=l*(a?Math.sqrt(o()):o());s.x+=Math.cos(u)*d,s.z+=Math.sin(u)*d,s.y>.05&&(s.y=Math.max(0,s.y+(o()-.5)*l));let f=s.x-e.x,p=s.z-e.z;return Math.hypot(f,p)<.6&&(f=_l(i)*.6,p=vl(i)*.6),new V(f,s.y-e.y,p).normalize()}var Tf=class{def;item;source;cooldown=0;reloadLeft=0;looseAmmo;constructor(e,t=null,n=null){this.def=e,this.item=t,this.source=n,this.looseAmmo=e.magazine}get ammo(){return this.item?this.item.loadedRounds??0:this.looseAmmo}set ammo(e){this.item?this.item.loadedRounds=e:this.looseAmmo=e}get reserve(){return this.source?this.source.ammoCount(this.def.ammoType):1/0}get reloading(){return this.reloadLeft>0}get reloadProgress(){return this.reloading?1-this.reloadLeft/this.def.reloadTime:-1}get ready(){return this.cooldown<=0&&!this.reloading&&this.ammo>0}get dry(){return this.ammo<=0&&this.reserve<=0}update(e){if(this.cooldown=Math.max(0,this.cooldown-e),this.reloading&&(this.reloadLeft-=e,this.reloadLeft<=0)){this.reloadLeft=0;let e=this.def.magazine-this.ammo;this.ammo+=this.source?this.source.takeAmmo(this.def.ammoType,e):e}}startReload(){return this.reloading||this.ammo>=this.def.magazine||this.reserve<=0?!1:(this.reloadLeft=this.def.reloadTime,!0)}cancelReload(){this.reloadLeft=0}refill(){this.ammo=this.def.magazine,this.reloadLeft=0,this.cooldown=0}fire(e,t,n,r){if(this.cooldown>0||this.reloading)return null;if(this.ammo<=0)return this.startReload(),null;this.ammo--,this.cooldown=this.def.fireInterval;let i=Cf(this.def),a=[];for(let o=0;o<i;o++)a.push(wf(e,t,this.def.spread*n,this.def.spreadGrowth,r,i>1));return{origin:e,dirs:a,weapon:this.def}}},Ef=(e,t)=>e+Math.random()*(t-e),Df=e=>e[Math.floor(Math.random()*e.length)];function Of(e){return`${Df(af[e])} ${Df(af.last)}`}function kf(e,t=new V){let n=e.mounted?2.2:q.npc.chestHeight*(1-(1-q.player.crouch.hitboxScale)*(e.crouch??0));return t.set(e.pos.x,n,e.pos.z)}var Af=class{def;name;model;lines;inventory=new uf(q.items.npcGrid.w,q.items.npcGrid.h);equipment=new lf;states=new WeakMap;onLoot=()=>{};onTrade=()=>{};pos=new V;prevPos=new V;vel=new B;collider;range=q.npc.talkRange;priority=1;mode=`routine`;hp;speech=null;speechLeft=0;moveYaw=0;lookYaw=0;path=null;dest=null;repathLeft=0;stuckLeft=1;progressFrom=new B;waitLeft=0;patrolIdx=0;talkLeft=0;alertLeft=0;warnCooldown=0;greetIdx=0;flinch=0;draw=0;drawTarget=0;telegraphLeft=0;shotDelay=0;recoil=0;wasReloading=!1;strafeLeft=0;aimPoint=new V;lastSeen=null;calmTimer=0;sees=!1;fleeLeft=0;cowering=!1;deadLeft=0;crouched=!1;crouch=0;flinchCrouchLeft=0;inspectLeft=0;lowCover=null;lastLowCover=null;inCover=!1;lowCoverLeft=0;lowCoverRetry=0;coverCheckLeft=0;popUpLeft=0;chest=new V;constructor(e){this.def=e,this.name=e.name??Of(e.appearance.body),this.lines={...rf[e.attitude],...e.lines},this.hp=this.maxHp,this.model=new bf(e.appearance,null),this.collider={kind:`circle`,x:0,z:0,r:q.npc.radius,coverHeight:1.9,surface:`wood`,blocksBullets:!1},this.spawn()}get weaponDef(){let e=this.equipment.weapons[0];return e?Bl(zl(e.defId)):null}get weapon(){let e=this.equipment.weapons[0],t=this.weaponDef;if(!e||!t)return null;let n=this.states.get(e);return n||(n=new Tf(t,e,this.inventory),this.states.set(e,n)),n}resetLoadout(){for(let e of[...this.inventory.placements])this.inventory.remove(e.item);for(let e of[`w0`,...of])this.equipment.take(e);let e=Il(this.def.weapon);e&&this.equipment.put(`w0`,Mu(Hl(e).id),null);for(let e of of){let t=this.def.appearance.clothing[e];t&&this.equipment.put(e,Mu(t),null)}let t=this.def.inventory;if(!t){let n=e?Ul(e.ammoType):null;t=n?Array.from({length:1+Math.floor(Math.random()*2)},()=>({item:n.id})):[]}for(let e of t)this.inventory.placeAnywhere(Mu(e.item,e.quantity??zl(e.item).boxQuantity??1));this.lootChanged()}lootChanged(){this.model.setWeapon(this.weaponDef)}get hasLoot(){return!this.inventory.isEmpty||this.equipment.weapons[0]!==null}get maxHp(){return this.def.hp??q.npc.hp}get alive(){return this.mode!==`dead`}get telegraphing(){return this.mode===`hostile`&&this.draw>=1&&this.telegraphLeft>0}get label(){return this.alive?this.def.shop?`Trade with ${this.name}`:`Talk to ${this.name}`:`Loot ${this.name}${this.hasLoot?``:` (empty)`}`}get promptHeight(){return this.alive?2.3:.9}get position(){return this.pos}canInteract(){return this.mode===`routine`||this.mode===`dead`}interact(){this.alive?(this.talkLeft=q.npc.talkTime,this.say(this.lines.greet[this.greetIdx++%this.lines.greet.length],q.npc.talkTime),this.def.shop&&this.onTrade(this)):this.onLoot(this)}get object(){return this.model.root}hitbox(){if(!this.alive)return null;let e=q.player.crouch.standHeight*ll(1,q.player.crouch.hitboxScale,this.crouch),[t,n]=this.mount?[1,2.95]:[0,e];return{x:this.pos.x,z:this.pos.z,r:.38,y0:t,y1:n}}test(e,t){let n=this.hitbox();if(!n)return null;let r=dd(e.x,e.y,e.z,t.x,t.y,t.z,n.x,n.z,n.r,n.y0,n.y1);return r?{t:r.t,normal:new V(r.nx,r.ny,r.nz)}:null}hit(e,t,n){return this.alive&&(this.hp-=n.damage,this.flinch=Math.max(this.flinch,.6),this.hp<=0&&this.die()),`blood`}provoke(e){this.alive&&(this.calmTimer=0,this.talkLeft=0,this.inspectLeft=0,this.weapon&&!this.weapon.dry?(this.mode!==`hostile`&&(this.mode=`hostile`,this.say(Df(this.lines.hostile)),this.drawTarget=1,this.shotDelay=0,this.telegraphLeft=this.weaponDef.ai.telegraph,this.aimPoint.copy(kf(e.player,this.chest)),this.clearPath()),this.lastSeen=e.player.pos.clone()):this.mode!==`flee`&&this.mode!==`hide`&&this.startFleeing())}stagger(){this.flinch=1,this.telegraphLeft=Math.max(this.telegraphLeft,.8),this.clearPath()}nearMiss(){let e=q.npc.crouch;this.alive&&this.weaponDef&&this.canCrouch&&Math.random()<e.flinchChance&&(this.flinchCrouchLeft=Math.max(this.flinchCrouchLeft,Ef(...e.flinchTime))),this.mode===`routine`&&(this.flinch=1,this.alertLeft=2.5,this.talkLeft=0,this.warnCooldown<=0&&(this.say(Df(this.lines.warn)),this.warnCooldown=q.npc.warnCooldown))}calmDown(e=!1){this.alive&&this.mode!==`routine`&&(this.mode=`routine`,this.drawTarget=0,this.cowering=!1,this.leaveLowCover(0),this.lastSeen=null,this.calmTimer=0,this.waitLeft=1,this.clearPath(),e||this.say(Df(this.lines.calm)))}startFleeing(){this.mode=`flee`,this.fleeLeft=2.2,this.cowering=!1,this.leaveLowCover(0),this.say(Df(this.lines.flee)),this.clearPath()}die(){this.mode=`dead`,this.hp=0,this.deadLeft=this.def.respawns===!1?1/0:q.npc.respawnTime,this.vel.set(0,0),this.clearPath(),this.speech=null,this.drawTarget=0,this.leaveLowCover(0),this.crouched=!1}spawn(){let[e,t]=this.def.spawn;this.pos.set(e,0,t),this.prevPos.copy(this.pos),this.vel.set(0,0),this.hp=this.maxHp,this.mode=`routine`,this.draw=this.drawTarget=0,this.crouched=!1,this.crouch=0,this.flinchCrouchLeft=this.inspectLeft=0,this.leaveLowCover(0),this.resetLoadout(),this.clearPath();let n=this.def.routine,r=n.kind===`lean`||n.kind===`idle`?n.facing:0;this.moveYaw=this.lookYaw=r,this.model.face(r),this.collider.x=e,this.collider.z=t,this.hostileByNature&&this.weaponDef&&(this.mode=`hostile`,this.drawTarget=1,this.telegraphLeft=this.weaponDef.ai.telegraph,Math.random()<.6&&this.say(Df(this.lines.hostile)))}get team(){return this.def.attitude===`hostile`?`outlaws`:void 0}get hostileByNature(){return this.def.attitude===`hostile`}mount=null;mountOn(e){this.mount=e,e.riderNpc=this,e.model.saddle.add(this.model.root),this.model.root.position.set(0,0,0),this.pos.copy(e.pos),this.prevPos.copy(e.pos)}dismount(e){let t=this.mount;if(!t)return;this.mount=null,t.riderNpc=null;let n=Math.random()<.5?-1:1;this.pos.set(t.pos.x+Math.cos(t.heading)*1.2*n,0,t.pos.z-Math.sin(t.heading)*1.2*n),this.prevPos.copy(this.pos),e.add(this.model.root),this.model.face(t.heading)}say(e,t=q.npc.speechTime){this.speech=e,this.speechLeft=t}step(e,t){if(this.prevPos.copy(this.pos),this.speechLeft-=e,this.speechLeft<=0&&(this.speech=null),this.flinch=gl(this.flinch,0,e*1.6),this.recoil=gl(this.recoil,0,e*5),this.warnCooldown-=e,this.mode===`dead`){this.deadLeft-=e,this.deadLeft<=0&&this.spawn();return}let n=t.player,r=kf(n,this.chest),i=Math.hypot(n.pos.x-this.pos.x,n.pos.z-this.pos.z);if(this.mount&&this.pos.copy(this.mount.pos),this.mode!==`routine`){let a=this.hostileByNature?60:q.npc.awarenessRange;this.sees=!n.dead&&i<a&&this.lineOfSight(t,r),this.sees||this.hostileByNature&&!n.dead?(this.calmTimer=0,this.lastSeen=n.pos.clone()):this.hostileByNature||(this.calmTimer+=e),this.calmTimer>=q.npc.calmTime&&this.calmDown()}switch(this.weaponDef&&(this.draw=gl(this.draw,this.drawTarget,e/this.weaponDef.drawTime),this.weapon.update(e)),this.mode){case`routine`:this.routine(e,t,i);break;case`hostile`:this.combat(e,t,i,r);break;case`flee`:case`hide`:this.flee(e,t,i)}this.updateCrouch(e),this.collider.x=this.pos.x,this.collider.z=this.pos.z}get canCrouch(){if(this.mount)return!1;let e=this.weaponDef,t=e?(Array.isArray(e.pellets)?e.pellets[1]:e.pellets)>1:!1;return this.def.tactics!==`rush`&&!t}updateCrouch(e){this.flinchCrouchLeft-=e,this.popUpLeft-=e;let t=!1;this.mode===`hide`?t=this.cowering:this.mode===`routine`?t=this.inspectLeft>0&&this.vel.lengthSq()<.04:this.mode===`hostile`&&(t=this.inCover&&this.popUpLeft<=0),this.flinchCrouchLeft>0&&this.mode!==`dead`&&(t=!0),this.crouched=t&&this.canCrouch,this.crouch=gl(this.crouch,+!!this.crouched,e/q.player.crouch.blendTime)}routine(e,t,n){let r=t.player,i=this.def.routine,a=!r.dead&&n<q.npc.noticeRange,o=yl(r.pos.x-this.pos.x,r.pos.z-this.pos.z);if(this.talkLeft-=e,this.alertLeft-=e,this.talkLeft>0||this.alertLeft>0||a&&i.kind!==`lean`&&i.kind!==`idle`)this.inspectLeft=0,this.lookYaw=o,this.halt(e,t);else if(i.kind===`lean`||i.kind===`idle`)this.distTo(i.at)>.4?(this.dest||this.setDest(i.at,t),this.followPath(e,q.npc.walkSpeed,t)&&this.clearPath()):(this.halt(e,t),this.moveYaw=i.facing,this.lookYaw=a?o:i.facing);else{if(!this.dest){if(this.halt(e,t),this.waitLeft-=e,this.inspectLeft-=e,this.waitLeft>0)return;this.inspectLeft=0;let n;if(i.kind===`wander`){let[e,r]=Df(i.points),a=i.jitter??1;n=t.nav.nearestFree(e+Ef(-a,a),r+Ef(-a,a))??[e,r]}else n=i.points[this.patrolIdx%i.points.length],this.patrolIdx++;this.setDest(n,t)}this.followPath(e,q.npc.walkSpeed,t)&&(this.clearPath(),this.waitLeft=i.kind===`wander`?Ef(...i.pause??[2,5]):i.pause??1,Math.random()<(i.inspect??0)&&(this.inspectLeft=Ef(...q.npc.crouch.inspectTime),this.waitLeft=Math.max(this.waitLeft,this.inspectLeft+.6))),this.lookYaw=this.moveYaw}}combat(e,t,n,r){let i=this.weaponDef,a=this.weapon;if(a.dry&&!a.reloading){this.drawTarget=0,this.startFleeing();return}let o=q.npc;this.aimPoint.x=pl(this.aimPoint.x,r.x,1/(this.def.reactionTime??o.reactionTime),e),this.aimPoint.y=pl(this.aimPoint.y,r.y,1/(this.def.reactionTime??o.reactionTime),e),this.aimPoint.z=pl(this.aimPoint.z,r.z,1/(this.def.reactionTime??o.reactionTime),e);let[s,c]=i.ai.preferredRange,l=o.combatSpeed,u=this.def.tactics??`strafe`;if(!this.mount&&!(u!==`rush`&&this.canCrouch&&this.sees&&this.holdLowCover(e,t,n,s,c))){if(u===`cover`&&this.sees&&n<=c+4&&this.takeCover(e,t,s,c))l=o.combatSpeed;else if(!this.sees)this.lastSeen&&this.distTo([this.lastSeen.x,this.lastSeen.z])>1?(this.repathLeft-=e,(!this.dest||this.repathLeft<=0)&&this.setDest([this.lastSeen.x,this.lastSeen.z],t)):(this.lastSeen=null,this.clearPath());else if(n>c)l=n>c+6||u===`rush`?o.runSpeed:o.combatSpeed,this.repathLeft-=e,(!this.dest||this.repathLeft<=0)&&this.setDest([t.player.pos.x,t.player.pos.z],t);else if(n<s){if(this.repathLeft-=e,!this.dest||this.repathLeft<=0){let e=(this.pos.x-t.player.pos.x)/Math.max(n,.01),r=(this.pos.z-t.player.pos.z)/Math.max(n,.01),i=t.nav.nearestFree(this.pos.x+e*3,this.pos.z+r*3,3);i&&this.setDest(i,t)}}else{if(this.strafeLeft-=e,this.strafeLeft<=0&&(this.strafeLeft=Ef(1.2,2.6),this.clearPath(),Math.random()<.5)){let e=Math.random()<.5?-1:1,r=this.pos.x+-(t.player.pos.z-this.pos.z)/Math.max(n,.01)*2*e,i=this.pos.z+(t.player.pos.x-this.pos.x)/Math.max(n,.01)*2*e,a=t.nav.nearestFree(r,i,1.5);a&&this.setDest(a,t)}l=o.combatSpeed*.6}}if(this.mount||(this.dest?this.followPath(e,l,t)&&this.clearPath():this.halt(e,t)),!this.sees&&this.lowCover&&this.leaveLowCover(1),this.sees?this.lookYaw=yl(this.aimPoint.x-this.pos.x,this.aimPoint.z-this.pos.z):this.mount?this.lookYaw=this.mount.heading:this.vel.lengthSq()>.04&&(this.lookYaw=this.moveYaw),a.ammo===0&&a.startReload(),this.wasReloading&&!a.reloading&&(this.telegraphLeft=i.ai.telegraph*.6),this.wasReloading=a.reloading,this.draw<1||(this.telegraphLeft-=e,this.shotDelay-=e,!this.sees||this.telegraphLeft>0||this.shotDelay>0||!a.ready||n>i.range*.9))return;let d=this.lookYaw,f=_l(d),p=vl(d),m=.4+Zl(i.look),h=this.mount?2.34:1.38-q.player.crouchDrop*this.crouch,g=new V(this.pos.x+f*m+p*.18,h,this.pos.z+p*m-f*.18);if(t.world.raycast(g.x,g.y,g.z,this.aimPoint.x,this.aimPoint.y,this.aimPoint.z)){this.inCover&&this.crouch>.02?this.popUpLeft=Math.max(this.popUpLeft,.4):this.shotDelay=.3;return}let _=this.vel.lengthSq()>.25,v=q.player.crouch,y=_?ll(o.movingSpreadMul,v.movingSpreadMul,this.crouch):ll(1,v.spreadMul,this.crouch),b=(this.def.inaccuracy??o.inaccuracy)*y;this.mount&&(b=(this.def.inaccuracy??o.inaccuracy)*(q.player.spreadMountedMul+this.mount.motor.speed*q.player.spreadMountedPerSpeed)*.5);let x=a.fire(g,this.aimPoint,b,d);x&&(t.fire(this,x),this.recoil=1,this.shotDelay=i.fireInterval+Ef(...i.ai.extraDelay),this.inCover&&this.popUpLeft>0&&(this.popUpLeft=o.crouch.popUpHold))}flee(e,t,n){let r=t.player,i=q.npc.runSpeed;if(this.mode===`flee`){if(this.fleeLeft-=e,this.repathLeft-=e,!this.dest||this.repathLeft<=0){let e=(this.pos.x-r.pos.x)/Math.max(n,.01),i=(this.pos.z-r.pos.z)/Math.max(n,.01),a=t.nav.nearestFree(this.pos.x+e*8,this.pos.z+i*8,4);a&&this.setDest(a,t),this.repathLeft=.8}this.followPath(e,i,t),this.fleeLeft<=0&&(this.mode=`hide`,this.cowering=!1,this.setDest(this.pickHideSpot(t),t))}else this.cowering?(this.halt(e,t),this.sees&&n<q.npc.hideBreakRange&&this.startFleeing()):(!this.dest||this.followPath(e,i,t))&&(this.clearPath(),this.cowering=!0);this.lookYaw=this.cowering?yl(r.pos.x-this.pos.x,r.pos.z-this.pos.z):this.moveYaw}pickHideSpot(e){let t=e.player.pos,n=null,r=1/0;for(let i of e.hideSpots){let a=this.distTo(i),o=Math.hypot(i[0]-t.x,i[1]-t.z);if(a>30||o<6)continue;let s=e.world.raycast(t.x,1.2,t.z,i[0],1,i[1])!==null,c=o<a?8:0,l=a-o*.6+c+(s?0:20);l<r&&(r=l,n=i)}return n??[this.pos.x,this.pos.z]}distTo([e,t]){return Math.hypot(e-this.pos.x,t-this.pos.z)}coverSpot=null;coverLeft=0;holdLowCover(e,t,n,r,i){let a=q.npc.crouch,o=t.player.pos;if(this.lowCoverLeft-=e,this.coverCheckLeft-=e,this.lowCover&&this.coverCheckLeft<=0&&(this.coverCheckLeft=.5,(n<r*.6||!vf(t.world,this.lowCover,o,kf(t.player,this.chest).y))&&this.leaveLowCover(Ef(.8,1.5))),this.lowCover&&this.lowCoverLeft<=0&&this.leaveLowCover(Ef(1.5,3)),!this.lowCover){if(this.lowCoverRetry-=e,this.lowCoverRetry>0)return!1;if(this.def.tactics!==`cover`&&Math.random()>a.strafeCoverChance)return this.lowCoverRetry=Ef(3,5),!1;let n=t.colliders.filter(e=>e!==this.collider).map(e=>[e.x,e.z]);this.lastLowCover&&n.push(this.lastLowCover);let s=yf(t.world,t.nav,{from:[this.pos.x,this.pos.z],threat:o,range:[r*.8,i+2],maxTravel:a.maxTravel,avoid:n});if(!s)return this.lowCoverRetry=Ef(1.5,2.5),!1;this.lowCover=s,this.lowCoverLeft=Ef(...a.holdTime),this.coverCheckLeft=.5,this.setDest(s,t)}return this.distTo(this.lowCover)<.35?(this.inCover=!0,this.clearPath()):!this.inCover&&!this.dest&&this.setDest(this.lowCover,t),!0}leaveLowCover(e){this.lowCover&&(this.lastLowCover=this.lowCover),this.lowCover&&!this.inCover&&this.clearPath(),this.lowCover=null,this.inCover=!1,this.popUpLeft=0,this.lowCoverRetry=e}takeCover(e,t,n,r){this.coverLeft-=e;let i=t.player.pos;if(!this.coverSpot||this.coverLeft<=0){this.coverLeft=Ef(3.5,5.5);let e=null,a=1/0;for(let o of t.hideSpots){let s=Math.hypot(o[0]-i.x,o[1]-i.z);if(s<n||s>r)continue;let c=this.distTo(o);if(c>14||t.world.raycast(o[0],q.npc.eyeHeight,o[1],i.x,q.npc.chestHeight,i.z))continue;let l=c+Math.abs(s-(n+r)/2)*.3;l<a&&(a=l,e=o)}this.coverSpot=e,e&&this.setDest(e,t)}return this.coverSpot?(this.distTo(this.coverSpot)<.5&&this.clearPath(),!0):!1}lineOfSight(e,t){let n=this.mount?2.5:q.npc.eyeHeight;return e.world.raycast(this.pos.x,n,this.pos.z,t.x,t.y,t.z)===null}setDest(e,t){this.dest=e,this.path=t.nav.findPath(this.pos.x,this.pos.z,e[0],e[1])??[e],this.repathLeft=.7,this.stuckLeft=1,this.progressFrom.set(this.pos.x,this.pos.z)}clearPath(){this.dest=null,this.path=null}halt(e,t){this.steer(e,0,0,t)}followPath(e,t,n){if(!this.path||this.path.length===0)return this.halt(e,n),!0;let[r,i]=this.path[0],a=Math.hypot(r-this.pos.x,i-this.pos.z);for(;a<.3&&this.path.length>0;){if(this.path.shift(),this.path.length===0)return this.halt(e,n),!0;[r,i]=this.path[0],a=Math.hypot(r-this.pos.x,i-this.pos.z)}t*=ll(1,q.player.crouch.speedMul,this.crouch);let o=this.path.length===1?Math.min(t,a*3):t;return this.steer(e,(r-this.pos.x)/a*o,(i-this.pos.z)/a*o,n),this.stuckLeft-=e,this.stuckLeft<=0&&(this.progressFrom.distanceTo(new B(this.pos.x,this.pos.z))<.3&&this.dest&&this.setDest(this.dest,n),this.stuckLeft=1,this.progressFrom.set(this.pos.x,this.pos.z)),!1}steer(e,t,n,r){let i=14*e,a=t-this.vel.x,o=n-this.vel.y,s=Math.hypot(a,o);if(s<=i?this.vel.set(t,n):this.vel.set(this.vel.x+a/s*i,this.vel.y+o/s*i),this.vel.lengthSq()<1e-6)return;this.pos.x+=this.vel.x*e,this.pos.z+=this.vel.y*e;let c={x:this.pos.x,z:this.pos.z},l=r.colliders.filter(e=>e!==this.collider),u=r.world.resolveCircle(c,q.npc.radius,l);if(this.pos.x=c.x,this.pos.z=c.z,u.hit){let e=this.vel.x*u.nx+this.vel.y*u.nz;e<0&&this.vel.set(this.vel.x-e*u.nx,this.vel.y-e*u.nz)}this.vel.lengthSq()>.04&&(this.moveYaw=yl(this.vel.x,this.vel.y))}sync(e,t){if(this.mount){let e=this.mount.renderYawValue;this.model.animate(t,{speed:0,moveYaw:0,lookYaw:fl(e,this.lookYaw),draw:this.draw,recoil:this.recoil,reload:this.weapon?.reloadProgress??-1,lean:!1,talking:!1,flinch:this.flinch,cower:!1,crouch:0,inspect:!1,dead:!1,mounted:!0});return}this.model.root.position.lerpVectors(this.prevPos,this.pos,e);let n=this.def.routine,r=(n.kind===`lean`||n.kind===`idle`)&&this.mode===`routine`&&this.distTo(n.at)<=.4;this.model.animate(t,{speed:this.vel.length(),moveYaw:this.moveYaw,lookYaw:this.lookYaw,draw:this.draw,recoil:this.recoil,reload:this.weapon?.reloadProgress??-1,lean:r&&n.kind===`lean`&&this.alertLeft<=0,talking:this.talkLeft>0,flinch:this.flinch,cower:this.mode===`hide`&&this.cowering,crouch:this.crouch,inspect:this.mode===`routine`&&this.inspectLeft>0,dead:this.mode===`dead`,mounted:!1})}},jf=class{world;nav;group=new U;npcs;hideSpots;colliders=[];tmpA=new V;tmpB=new V;constructor(e,t,n,r){this.world=t,this.nav=n,this.npcs=e.map(e=>new Af(e));for(let e of this.npcs)this.group.add(e.model.root);this.hideSpots=Mf(r,n)}get bodies(){return this.npcs.filter(e=>e.alive&&!e.mount).map(e=>e.collider)}add(e){let t=new Af(e);return this.npcs.push(t),this.group.add(t.model.root),t}remove(e){let t=this.npcs.indexOf(e);t<0||(this.npcs.splice(t,1),e.model.root.removeFromParent(),Xu(e.model.root))}update(e,t,n,r){this.colliders.length=0,this.colliders.push(...n,...this.bodies);let i={world:this.world,nav:this.nav,player:t,colliders:this.colliders,hideSpots:this.hideSpots,fire:r};for(let t of this.npcs)t.step(e,i)}onPlayerHitNpc(e,t){let n=this.contextFor(t);e.provoke(n);let r=q.npc,i=kf(t,this.tmpA);for(let t of this.npcs)t!==e&&t.alive&&t.def.defendsOthers&&(t.pos.distanceTo(e.pos)>r.witnessRange||(this.lineOfSight(t.pos,this.tmpB.set(e.pos.x,r.chestHeight,e.pos.z))||this.lineOfSight(t.pos,i))&&t.provoke(n))}onPlayerShotLanded(e,t){let n=q.npc.nearMissRadius;for(let r of this.npcs)r!==t&&r.alive&&Math.hypot(e.x-r.pos.x,e.z-r.pos.z)<=n&&r.nearMiss()}calmAll(){for(let e of this.npcs)e.calmDown(!0)}lineOfSight(e,t){let n=q.npc.eyeHeight;return this.world.raycast(e.x,n,e.z,t.x,t.y,t.z)===null}contextFor(e){return{world:this.world,nav:this.nav,player:e,colliders:this.colliders,hideSpots:this.hideSpots,fire:()=>{}}}};function Mf(e,t){let n=[];for(let t of e){let e=t.minX-1,r=t.maxX+1,i=t.minZ-1,a=t.maxZ+1;for(let t=e;t<=r;t+=2)n.push([t,i],[t,a]);for(let t=i+2;t<a;t+=2)n.push([e,t],[r,t])}return n.filter(([e,n])=>t.isFree(e,n))}var Nf={dust:{colors:[J.sandLight,J.sand,J.sandPale],count:[6,9],speed:[.6,2.2],up:1.4,life:[.35,.7],size:[.1,.2],gravity:-2,drag:3},spark:{colors:[J.brassLight,J.white,J.orange],count:[4,7],speed:[3,7],up:2,life:[.12,.25],size:[.05,.08],gravity:-12,drag:1},wood:{colors:[J.woodPale,J.woodLight,J.wood],count:[5,8],speed:[1.5,4],up:3,life:[.4,.8],size:[.06,.12],gravity:-16,drag:1},glass:{colors:[J.glass,J.skyPale,J.white,J.glassBrown],count:[12,16],speed:[1.5,4.5],up:3,life:[.4,.8],size:[.05,.1],gravity:-18,drag:.6},straw:{colors:[J.sandPale,J.sandLight,J.brassLight],count:[7,11],speed:[1.5,3.5],up:2.5,life:[.4,.9],size:[.06,.11],gravity:-10,drag:2},rock:{colors:[J.rockLight,J.rock,J.sandLight],count:[5,8],speed:[1.5,3.5],up:2.5,life:[.3,.6],size:[.06,.12],gravity:-16,drag:1.5},cactus:{colors:[J.cactusLight,J.cactus,J.sandPale],count:[5,8],speed:[1,3],up:2,life:[.3,.6],size:[.06,.1],gravity:-14,drag:2},blood:{colors:[J.red,J.redDark,J.rust],count:[6,9],speed:[1,3],up:1.5,life:[.3,.6],size:[.06,.11],gravity:-14,drag:1.5},hoof:{colors:[J.sandLight,J.sand,J.sandDark],count:[2,3],speed:[.4,1.4],up:1.2,life:[.3,.55],size:[.12,.22],gravity:-1.5,drag:3}},Pf=900,Ff=class{mesh;count=0;p=new Float32Array(Pf*3);v=new Float32Array(Pf*3);life=new Float32Array(Pf);maxLife=new Float32Array(Pf);size=new Float32Array(Pf);grav=new Float32Array(Pf);drag=new Float32Array(Pf);col=new Float32Array(Pf*3);color=new W;constructor(){this.mesh=new Kr(new mi(1,1,1),new Sr,Pf),this.mesh.instanceColor=new Rr(new Float32Array(Pf*3),3),this.mesh.count=0,this.mesh.frustumCulled=!1}burst(e,t,n,r=1){let i=Nf[e],a=Math.round(If(i.count[0],i.count[1])*r);for(let e=0;e<a;e++){let e=If(-1,1),r=If(0,1),a=If(-1,1);n&&(e=e*.7+n.x,r=r*.7+Math.max(0,n.y),a=a*.7+n.z);let o=Math.hypot(e,r,a)||1,s=If(i.speed[0],i.speed[1]);this.spawn(t.x,t.y,t.z,e/o*s,r/o*s+If(0,i.up),a/o*s,If(i.life[0],i.life[1]),If(i.size[0],i.size[1]),i.gravity,i.drag,i.colors[Math.random()*i.colors.length|0])}}spawn(e,t,n,r,i,a,o,s,c,l,u){if(this.count>=Pf)return;let d=this.count++;this.p.set([e,t,n],d*3),this.v.set([r,i,a],d*3),this.life[d]=this.maxLife[d]=o,this.size[d]=s,this.grav[d]=c,this.drag[d]=l,this.color.setHex(u),this.col.set([this.color.r,this.color.g,this.color.b],d*3)}update(e){let t=0;for(;t<this.count;){if(this.life[t]-=e,this.life[t]<=0){this.swapRemove(t);continue}let n=t*3,r=Math.exp(-this.drag[t]*e);this.v[n]*=r,this.v[n+2]*=r,this.v[n+1]=this.v[n+1]*r+this.grav[t]*e,this.p[n]+=this.v[n]*e,this.p[n+1]+=this.v[n+1]*e,this.p[n+2]+=this.v[n+2]*e,this.p[n+1]<.03&&(this.p[n+1]=.03,this.v[n+1]*=-.3,this.v[n]*=.6,this.v[n+2]*=.6),t++}this.writeInstances()}swapRemove(e){let t=--this.count;e!==t&&(this.p.copyWithin(e*3,t*3,t*3+3),this.v.copyWithin(e*3,t*3,t*3+3),this.col.copyWithin(e*3,t*3,t*3+3),this.life[e]=this.life[t],this.maxLife[e]=this.maxLife[t],this.size[e]=this.size[t],this.grav[e]=this.grav[t],this.drag[e]=this.drag[t])}writeInstances(){let e=this.mesh.instanceMatrix.array,t=this.mesh.instanceColor.array;for(let n=0;n<this.count;n++){let r=this.life[n]/this.maxLife[n],i=this.size[n]*(.35+.65*r),a=n*16;e[a]=i,e[a+1]=0,e[a+2]=0,e[a+3]=0,e[a+4]=0,e[a+5]=i,e[a+6]=0,e[a+7]=0,e[a+8]=0,e[a+9]=0,e[a+10]=i,e[a+11]=0,e[a+12]=this.p[n*3],e[a+13]=this.p[n*3+1],e[a+14]=this.p[n*3+2],e[a+15]=1,t[n*3]=this.col[n*3],t[n*3+1]=this.col[n*3+1],t[n*3+2]=this.col[n*3+2]}this.mesh.count=this.count,this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor.needsUpdate=!0}};function If(e,t){return e+Math.random()*(t-e)}var Lf={body:`male`,skin:J.skin,hair:J.darkBrown,hairStyle:`short`,beard:J.brown,clothing:{hat:`cowboy_hat_brown`,top:`shirt_cream`,outerwear:`poncho_rust`,neck:`bandana_red`,legs:`trousers_denim`,belt:`belt_leather`,holster:`holster_leather`,boots:`boots_brown`}},Rf={weapons:[`revolver`,null,null],grid:[{item:`ammo_revolver`,quantity:18},{item:`ammo_revolver`,quantity:18}]},zf=class{rig;phase=0;time=0;hipsYaw=0;upperYaw=0;fall=0;constructor(e){this.rig=new lu(e)}get root(){return this.rig.root}setAppearance(e){this.rig.applyAppearance(e)}setWeapons(e){this.rig.setWeapons(e)}animate(e,t){this.time+=e;let{hips:n,upper:r,head:i,armL:a,armR:o}=this.rig,s=t.speed>.3;if(t.mounted){this.hipsYaw=0;let i=fl(t.horseYaw,t.aimYaw);this.upperYaw=t.draw>.5?i:sl(i,-.6,.6),n.rotation.y=0,r.rotation.y=this.upperYaw,this.rig.poseLegs(tu({...this.gait(0,0,t),mounted:!0}),e),this.rig.placePelvis(.88,0),r.rotation.x=0}else{let i=t.moveYaw,a=1;if(s&&t.draw>.5&&Math.abs(fl(t.moveYaw,t.aimYaw))>1.9&&(i=t.moveYaw+Math.PI,a=-1),!s){let e=fl(this.hipsYaw,t.aimYaw);i=Math.abs(e)>.9?t.aimYaw-Math.sign(e)*.6:this.hipsYaw}this.hipsYaw=ml(this.hipsYaw,i,14,e);let o=t.draw>.5?t.aimYaw:this.hipsYaw+sl(fl(this.hipsYaw,t.aimYaw),-.6,.6);this.upperYaw=ml(this.upperYaw,o,t.draw>.5?30:10,e),n.rotation.y=this.hipsYaw,r.rotation.y=this.upperYaw,s&&(this.phase+=e*t.speed*(t.sprint?1.9:2.3)*a),this.stride=pl(this.stride,s?sl(t.speed/4.3,.35,1):0,8,e),this.run=pl(this.run,t.sprint&&s?1:0,6,e);let c=this.rig.poseLegs(tu(this.gait(this.stride,this.run,t)),e);this.rig.placePelvis(c,t.crouch),r.rotation.x=(s?ll(.05,.14,this.run):0)+iu*t.crouch}let c=t.draw>.5;this.rig.placeWeapons(t.active,c);let l=t.active===null?null:this.rig.weaponMesh(t.active),u=t.reload>=0,d=t.longGun?-Math.PI/2+.08-t.recoil*.25:-Math.PI/2-t.recoil*.55,f=0,p=t.longGun?-.25:-.12;if(u){let e=Math.sin(Math.min(1,t.reload)*Math.PI);d=-.6-.5*e,f=.5*e,p=0,l&&(l.rotation.z=Math.sin(t.reload*30)*.15*e)}else l&&c&&(l.rotation.z=0);if(t.draw<1){let e=t.mounted?-.3:this.legSwing(t)*.6-.1,[n,r]=t.longGun?[-2.7,.35]:[.3,.12],i=t.draw;i<.5?(d=ll(e,n,i*2),f=ll(.06,r,i*2)):(d=ll(n,d,i*2-1),f=ll(r,f,i*2-1)),p*=Math.max(0,i*2-1)}let m=t.draw>0&&t.draw<1,h=t.mounted?0:iu*t.crouch;t.draw>.5&&(d-=h),o.rotation.x=pl(o.rotation.x,d,u?14:m?24:40,e),o.rotation.z=pl(o.rotation.z,f,14,e),o.rotation.y=p,r.rotation.x+=-t.recoil*(t.longGun?.06:.12);let g=t.longGun&&!u?Math.max(0,t.draw*2-1):0,_=u?-.9:t.mounted?-.5:-this.legSwing(t)*.6-.1;a.rotation.x=pl(a.rotation.x,ll(_,-Math.PI/2+.15-h,g),14,e),a.rotation.y=pl(a.rotation.y,.55*g,14,e),a.rotation.z=pl(a.rotation.z,u?-.4:-.08*(1-g),14,e),i.rotation.x=-t.recoil*.1-h*.8;let v=t.mounted?fl(t.horseYaw,t.aimYaw):t.aimYaw;i.rotation.y=pl(i.rotation.y,sl(fl(this.upperYaw,v),-.7,.7),10,e),this.fall=gl(this.fall,+!!t.dead,e*(t.dead?1.6:6));let y=ul(.3,1,this.fall)**2;this.rig.body.quaternion.setFromAxisAngle(this.fallAxis.set(Math.cos(this.upperYaw),0,-Math.sin(this.upperYaw)),-y*1.5),this.rig.body.position.y=y*.14}get buckle(){return this.fall<.6?ul(0,.35,this.fall):ll(1,.35,(this.fall-.6)/.4)}gait(e,t,n){return{phase:this.phase,stride:e,run:t,crouch:n.crouch,time:this.time,buckle:n.dead||this.fall>0?this.buckle:0,mounted:!1,crossed:!1}}stride=0;run=0;legSwing(e){return this.rig.legL.rotation.x+1.15*e.crouch}fallAxis=new V},Bf=class{model;inventory=new uf(q.items.playerGrid.w,q.items.playerGrid.h);equipment=new lf;look;seenVersion=-1;active=0;pending=null;swapping=!1;activeItem=null;states=new WeakMap;noAmmo=0;pos=new V;prevPos=new V;vel=new B;moveYaw=0;aimYaw=0;sprinting=!1;recoil=0;draw=0;hp=q.player.maxHp;dead=!1;regen=!0;invulnerable=0;healLeft=0;healRate=0;healTotal=0;hurt=0;sinceHurt=0;mounted=!1;mountSpeed=0;mountYaw=0;constructor(){let{clothing:e,...t}=Lf;this.look=t,this.model=new zf(Lf);for(let t of of){let n=e[t];n&&this.equipment.put(t,Mu(n),null)}Rf.weapons.forEach((e,t)=>e&&this.equipment.put(sf(t),Mu(e),null));for(let e of Rf.grid)this.inventory.placeAnywhere(Mu(e.item,e.quantity??zl(e.item).boxQuantity??1));this.syncEquipment()}get object(){return this.model.root}get weapon(){let e=this.active===null?null:this.equipment.weapons[this.active];return e?this.stateFor(e):null}stateFor(e){let t=this.states.get(e);return t||(t=new Tf(Bl(zl(e.defId)),e,this.inventory),this.states.set(e,t)),t}get ammo(){return this.weapon?.ammo??0}get reloadProgress(){return this.weapon?.reloadProgress??-1}appearance(){return this.equipment.appearance(this.look)}syncEquipment(){if(this.equipment.version===this.seenVersion)return;this.seenVersion=this.equipment.version,this.model.setAppearance(this.appearance()),this.model.setWeapons(this.equipment.weaponDefs());let e=this.active===null?null:this.equipment.weapons[this.active];e!==this.activeItem&&(this.activeItem&&this.states.get(this.activeItem)?.cancelReload(),this.activeItem=e,this.holster(!0),this.pending=null)}speed(){return this.vel.length()}setPosition(e){this.pos.copy(e),this.prevPos.copy(e)}updateMovement(e,t,n,r){if(this.prevPos.copy(this.pos),this.mounted){this.crouched=!1,this.crouch=0;return}this.dead&&(t={...t,moveX:0,moveZ:0});let i=q.player,a=t.moveX!==0||t.moveZ!==0;t.crouch&&!this.dead?this.crouched?this.tryStand(n):this.crouched=!0:t.sprint&&this.crouched&&this.tryStand(n),this.crouch=gl(this.crouch,+!!this.crouched,e/i.crouch.blendTime),this.sprinting=a&&t.sprint&&!this.crouched;let o=(this.sprinting?i.sprintSpeed:i.walkSpeed)*(this.crouched?i.crouch.speedMul:1),s=t.moveX*o,c=t.moveZ*o,l=(a?i.acceleration:i.deceleration)*e,u=s-this.vel.x,d=c-this.vel.y,f=Math.hypot(u,d);f<=l?this.vel.set(s,c):this.vel.set(this.vel.x+u/f*l,this.vel.y+d/f*l),this.pos.x+=this.vel.x*e,this.pos.z+=this.vel.y*e;let p={x:this.pos.x,z:this.pos.z},m=n.resolveCircle(p,i.radius,r);if(this.pos.x=p.x,this.pos.z=p.z,m.hit){let e=this.vel.x*m.nx+this.vel.y*m.nz;e<0&&this.vel.set(this.vel.x-e*m.nx,this.vel.y-e*m.nz)}this.vel.lengthSq()>.04&&(this.moveYaw=yl(this.vel.x,this.vel.y))}crouched=!1;crouch=0;tryStand(e){let t=q.player;return!e.blocksStanding(this.pos.x,this.pos.z,t.radius,t.standHeightCrouched,t.crouch.standHeight)&&(this.crouched=!1,!0)}cancelCrouch(){this.crouched=!1,this.crouch=0}updateWeapon(e,t){this.syncEquipment();let n=t.aim.x-this.pos.x,r=t.aim.z-this.pos.z;n*n+r*r>.01&&(this.aimYaw=yl(n,r)),this.recoil=gl(this.recoil,0,e*5),this.noAmmo=Math.max(0,this.noAmmo-e);let i=this.equipment.weapons;t.select!==null&&i[t.select]&&(t.select===this.active&&this.drawTarget===1&&this.pending===null?this.holster():(t.select!==this.active||this.drawTarget===0)&&(this.weapon?.cancelReload(),this.swapping=!0,this.draw>0&&t.select!==this.active?(this.pending=t.select,this.drawTarget=0):(this.active=t.select,this.drawTarget=1),this.idle=0)),this.idle+=e,t.holster||this.drawTarget===1&&this.idle>=q.player.autoHolsterTime?this.holster():(t.fireHeld||t.reload)&&this.drawTarget===0&&this.pending===null&&this.healLeft<=0&&((this.active===null||!i[this.active])&&(this.active=i.findIndex(e=>e!==null)),this.active<0&&(this.active=null),this.active!==null&&(this.drawTarget=1,this.idle=0));let a=this.weapon,o=this.swapping?q.items.weaponSwapTime/2:a?.def.drawTime??.4;if(this.draw=gl(this.draw,this.drawTarget,e/o),this.draw===0&&this.pending!==null&&(this.active=this.pending,this.pending=null,this.drawTarget=1),(this.draw===1||this.drawTarget===0)&&(this.swapping=this.pending!==null),this.activeItem=this.active===null?null:i[this.active],!a||(a.update(e),t.reload&&(this.reloadQueued=!0),this.draw<1||this.healLeft>0)||(this.reloadQueued&&(this.reloadQueued=!1,!a.startReload()&&a.ammo<a.def.magazine&&a.reserve<=0&&(this.noAmmo=1.5)),!t.fireHeld))return null;if(a.ammo<=0&&a.reserve<=0)return t.fireHeld&&(this.noAmmo=1.5),null;let s=this.mounted?2.34:1.38-q.player.crouchDrop*this.crouch,c=_l(this.aimYaw),l=vl(this.aimYaw),u=l,d=-c,f=.4+Zl(a.def.look),p=new V(this.pos.x+c*f+u*.18,this.pos.y+s,this.pos.z+l*f+d*.18),m=q.player,h=1,g=this.speed()>.5;h=this.mounted?m.spreadMountedMul+this.mountSpeed*m.spreadMountedPerSpeed:ll(g?m.spreadMovingMul:1,g?m.crouch.movingSpreadMul:m.crouch.spreadMul,this.crouch);let _=a.fire(p,t.aim,h,this.aimYaw);return _&&(this.recoil=1,this.idle=0),_}get drawn(){return this.drawTarget===1}holster(e=!1){this.drawTarget=0,this.pending=null,this.reloadQueued=!1,this.weapon?.cancelReload(),e&&(this.draw=0)}reloadQueued=!1;drawTarget=0;idle=0;hitbox(){if(this.dead)return null;let[e,t]=this.mounted?[1,2.95]:[0,1.85*ll(1,q.player.crouch.hitboxScale,this.crouch)];return{x:this.pos.x,z:this.pos.z,r:.38,y0:e,y1:t}}test(e,t){let n=this.hitbox();if(!n)return null;let r=dd(e.x,e.y,e.z,t.x,t.y,t.z,n.x,n.z,n.r,n.y0,n.y1);return r?{t:r.t,normal:new V(r.nx,r.ny,r.nz)}:null}hit(e,t,n){return!this.dead&&this.invulnerable<=0&&(this.hp=Math.max(0,this.hp-n.damage),this.sinceHurt=0,this.hurt=1),`blood`}update(e){if(this.hurt=Math.max(0,this.hurt-e*2.5),this.dead)return;this.sinceHurt+=e;let t=q.player;if(this.invulnerable=Math.max(0,this.invulnerable-e),this.healLeft>0){let t=Math.min(e,this.healLeft);this.hp=Math.min(q.player.maxHp,this.hp+this.healRate*t),this.healLeft-=t}this.regen&&this.sinceHurt>t.regenDelay&&(this.hp=Math.min(t.maxHp,this.hp+t.regenRate*e))}get healProgress(){return this.healLeft>0?1-this.healLeft/this.healTotal:-1}useItem(e){let t=zl(e.defId);return t.heal?this.dead?`Not now`:this.healLeft>0?`Already bandaging`:this.hp>=q.player.maxHp?`Already at full health`:(e.quantity--,e.quantity<=0&&this.inventory.remove(e),this.healTotal=t.heal.duration,this.healLeft=t.heal.duration,this.healRate=t.heal.fraction*q.player.maxHp/t.heal.duration,this.holster(),null):null}useBandage(){let e=this.inventory.items.filter(e=>zl(e.defId).heal).sort((e,t)=>e.quantity-t.quantity);return e.length===0?`No bandages`:this.useItem(e[0])}revive(e,t=1){this.dead=!1,this.healLeft=0,this.hp=q.player.maxHp*t,this.vel.set(0,0),this.setPosition(e)}animate(e){this.syncEquipment();let t=this.weapon?.def??null;this.model.animate(e,{speed:this.mounted?0:this.speed(),sprint:this.sprinting,moveYaw:this.moveYaw,aimYaw:this.aimYaw,recoil:this.recoil,reload:this.reloadProgress,mounted:this.mounted,horseYaw:this.mountYaw,dead:this.dead,draw:this.draw,active:this.weapon?this.active:null,crouch:this.crouch,longGun:t?.look.kind===`longgun`})}},Vf=class{group=new U;bullets=[];geo=new mi(.11,.11,1);mat=new Sr({color:J.brassLight});tmpA=new V;tmpB=new V;constructor(){this.geo.translate(0,0,-.5)}fire(e,t,n,r){let i=this.bullets.find(e=>!e.alive);if(!i){let e=new Pr(this.geo,this.mat);e.frustumCulled=!1,this.group.add(e),i={pos:new V,prev:new V,vel:new V,travelled:0,alive:!1,mesh:e,weapon:n,shooter:r},this.bullets.push(i)}i.pos.copy(e),i.prev.copy(e),i.vel.copy(t).multiplyScalar(n.bulletSpeed),i.travelled=0,i.alive=!0,i.weapon=n,i.shooter=r,i.mesh.visible=!0}update(e,t,n,r){for(let i of this.bullets){if(!i.alive)continue;i.prev.copy(i.pos);let a=i.pos,o=this.tmpB.copy(a).addScaledVector(i.vel,e),s=t.raycast(a.x,a.y,a.z,o.x,o.y,o.z),c=n.raycast(a,o,i.shooter),l=this.tmpA.copy(i.vel).normalize(),u=i.vel.length()*e,d=(e,t,n,s)=>{let c=a.clone().lerp(o,e),d=i.weapon.damage*Sf(i.weapon,i.travelled+u*e);r({point:c,normal:t,dir:l.clone(),surface:n,target:s,damage:d,shooter:i.shooter,weapon:i.weapon}),i.pos.copy(c),i.alive=!1};c&&(!s||c.t<=s.t)?d(c.t,c.normal,`target`,c.target):s?d(s.t,new V(s.nx,s.ny,s.nz),s.surface,null):(i.pos.copy(o),i.travelled+=u,i.travelled>i.weapon.range&&(i.alive=!1))}}live(){return this.bullets.filter(e=>e.alive).map(e=>e.pos)}sync(e){let t=q.projectiles.tracerLength;for(let n of this.bullets){if(!n.alive){n.mesh.visible=!1;continue}let r=this.tmpA.copy(n.prev).lerp(n.pos,e),i=n.travelled-r.distanceTo(n.pos);n.mesh.position.copy(r),this.tmpB.copy(r).add(n.vel),n.mesh.lookAt(this.tmpB),n.mesh.scale.set(1,1,Math.max(.05,Math.min(t,i)))}}},Hf=class{base;object=new U;alive=!0;timer=0;pop=1;constructor(e,t){this.base=e;let n=this.object;n.position.copy(e),Y(new gi(.15,.16,.38,6),t,0,.19,0,n),Y(new gi(.06,.12,.16,6),t,0,.46,0,n),Y(new gi(.065,.065,.08,6),J.cream,0,.58,0,n)}test(e,t){if(!this.alive)return null;let n=dd(e.x,e.y,e.z,t.x,t.y,t.z,this.base.x,this.base.z,.2,this.base.y-.05,this.base.y+.65);return n?{t:n.t,normal:new V(n.nx,n.ny,n.nz)}:null}hit(){return this.alive=!1,this.object.visible=!1,this.timer=q.targets.bottleRespawn,`glass`}update(e){if(this.alive||(this.timer-=e,this.timer<=0&&(this.alive=!0,this.object.visible=!0,this.pop=0)),this.pop<1){this.pop=Math.min(1,this.pop+e*4);let t=this.pop<.7?this.pop/.7*1.2:1.2-(this.pop-.7)/.3*.2;this.object.scale.setScalar(t)}}},Uf=class{base;object=new U;pivot=new U;tilt=new B;tiltVel=new B;hp=q.targets.dummyHp;state=`up`;timer=0;fall=0;fallDir=new B(1,0);flash=0;flashMesh;constructor(e,t){this.base=e,this.object.position.copy(e),this.object.rotation.y=t,this.object.add(this.pivot);let n=this.pivot;Y(X(.12,1.9,.12,-1),J.wood,0,0,0,n),Y(X(.9,.1,.1),J.wood,0,1.3,.02,n),this.flashMesh=Y(X(.5,.72,.32,-1),J.sandLight,0,.82,0,n),Y(X(.52,.08,.34),J.brown,0,1,0,n),Y(X(.34,.34,.3,-1),J.sandPale,0,1.56,0,n),Y(X(.2,.2,.04),J.red,0,1.08+.1,.17,n),Y(X(.08,.08,.05),J.cream,0,1.18,.18,n);for(let e of[-1,1])Y(X(.1,.1,.1),J.sandLight,e*.42,1.3,.02,n)}test(e,t){if(this.state!==`up`&&this.state!==`rising`)return null;let n=dd(e.x,e.y,e.z,t.x,t.y,t.z,this.base.x,this.base.z,.32,.6,1.95);return n?{t:n.t,normal:new V(n.nx,n.ny,n.nz)}:null}hit(e,t,n){if(this.tiltVel.x+=t.x*4.5,this.tiltVel.y+=t.z*4.5,this.flash=.08,this.state===`up`&&--this.hp<=0){this.state=`falling`,this.fall=0;let e=Math.hypot(t.x,t.z)||1;this.fallDir.set(t.x/e,t.z/e)}return`straw`}update(e){this.tiltVel.x+=(-60*this.tilt.x-5*this.tiltVel.x)*e,this.tiltVel.y+=(-60*this.tilt.y-5*this.tiltVel.y)*e,this.tilt.addScaledVector(this.tiltVel,e),this.tilt.clampLength(0,.6),this.state===`falling`?(this.fall=Math.min(1,this.fall+e*2.6),this.fall>=1&&(this.state=`down`,this.timer=q.targets.dummyRespawn)):this.state===`down`?(this.timer-=e,this.timer<=0&&(this.state=`rising`)):this.state===`rising`&&(this.fall=Math.max(0,this.fall-e*1.5),this.fall<=0&&(this.state=`up`,this.hp=q.targets.dummyHp));let t=(this.state===`falling`?this.fall*this.fall:this.fall)*(Math.PI/2-.08),n=this.tilt.x+this.fallDir.x*t,r=this.tilt.y+this.fallDir.y*t,i=sl(Math.hypot(n,r),0,Math.PI/2),a=new V(r,0,-n);a.lengthSq()>1e-8?(a.normalize().applyAxisAngle(cn.DEFAULT_UP,-this.object.rotation.y),this.pivot.quaternion.setFromAxisAngle(a,i)):this.pivot.quaternion.identity(),this.flash=Math.max(0,this.flash-e),this.flashMesh.scale.setScalar(this.flash>0?1.08:1)}},Wf=class{group=new U;targets=[];actors=[];addBottle(e,t){this.add(new Hf(e.clone(),t))}addDummy(e,t){this.add(new Uf(e.clone(),t))}addActor(e){this.actors.push(e)}removeActor(e){let t=this.actors.indexOf(e);t>=0&&this.actors.splice(t,1)}add(e){this.targets.push(e),this.group.add(e.object)}raycast(e,t,n=null){let r=null;for(let i of[this.targets,this.actors])for(let a of i){if(a===n||n?.team&&a.team===n.team)continue;let i=a.test(e,t);i&&(!r||i.t<r.t)&&(r={...i,target:a})}return r}update(e){for(let t of this.targets)t.update?.(e)}},Gf=.2;function Kf(e,t,n){let r=null,i=1/0;for(let a of e){let e=a.position.x-t.x,o=a.position.z-t.z,s=Math.hypot(e,o);if(s>a.range||!a.canInteract())continue;let c=(s<.6?0:Math.abs(fl(n,yl(e,o))))-a.priority*Gf;c<i&&(i=c,r=a)}return r}function qf(e){if(e.kind===`grid`){let t=e.grid.at(e.x,e.y);return t?(e.grid.remove(t.item),{item:t.item,from:{kind:`grid`,grid:e.grid,x:t.x,y:t.y},fromRotated:t.item.rotated,splitFrom:null}):null}let t=e.holder.take(e.key);return t?{item:t,from:e,fromRotated:t.rotated,splitFrom:null}:null}function Jf(e,t,n){let r=e.at(t,n);if(!r)return null;let i=ff(r.item);return i?{item:i,from:{kind:`grid`,grid:e,x:r.x,y:r.y},fromRotated:r.item.rotated,splitFrom:r.item}:qf({kind:`grid`,grid:e,x:t,y:n})}function Yf(e){e.splitFrom?e.splitFrom.quantity+=e.item.quantity:(e.item.rotated=e.fromRotated,e.from.kind===`grid`?e.from.grid.place(e.item,e.from.x,e.from.y,e.fromRotated):e.from.holder.put(e.from.key,e.item,null))}function Xf(e,t,n){if(e.kind===`grid`){let n=e.grid;return n.place(t,e.x,e.y,t.rotated)||n.place(t,e.x,e.y,!t.rotated)||n.placeAnywhere(t)}return e.holder.accepts(e.key,t)&&e.holder.put(e.key,t,n)}function Zf(e,t,n){let r=e.item;if(t.kind===`world`)return{ok:!0,dropped:r};let i=new Set;for(let n of[t,e.from])i.add(n.kind===`grid`?n.grid:n.holder);n&&i.add(n);let a=[...i].map(e=>e.snapshot()),o=()=>{for(let e of a)e();return Yf(e),{ok:!1}};if(t.kind===`grid`){let{grid:i,x:a,y:s}=t,c=Nu(r);if(!i.inBounds(a,s,c.w,c.h))return o();let l=i.overlapping(a,s,c.w,c.h);if(l.length===0)return i.place(r,a,s)?{ok:!0}:o();if(l.length>1)return o();let u=l[0];return u.item.defId===r.defId&&zl(r.defId).stackable?(df(r,u.item),r.quantity>0&&Yf(e),{ok:!0}):e.splitFrom||(i.remove(u.item),!i.place(r,a,s)||!Xf(e.from,u.item,n))?o():{ok:!0}}let{holder:s,key:c}=t;if(!s.accepts(c,r))return o();let l=s.get(c);if(l){if(e.splitFrom)return o();s.take(c)}return!s.put(c,r,n)||l&&!Xf(e.from,l,n)?o():{ok:!0}}function Qf(e,t,n){if(t.kind===`world`)return!0;let r=new Set;for(let n of[t,e.from])r.add(n.kind===`grid`?n.grid:n.holder);n&&r.add(n);let i=[...r].map(e=>e.snapshot()),{quantity:a,rotated:o}=e.item,s=e.splitFrom?.quantity??0,c=Zf({...e},t,n).ok;for(let e of i)e();return e.item.quantity=a,e.item.rotated=o,e.splitFrom&&(e.splitFrom.quantity=s),c}function $f(e,t){return e.add(t)}function ep(e,t,n=[]){let r=0;for(let e of n){let n=e.holder.take(e.key);n&&(t.placeAnywhere(n)?r++:e.holder.put(e.key,n,null))}for(let n of[...e.placements]){let{item:i,x:a,y:o}=n,s=i.rotated,c=i.quantity;e.remove(i);let l=t.add(i);l<c&&r++,l>0&&e.place(i,a,o,s)}let i=!e.isEmpty||n.some(e=>e.holder.get(e.key));return{moved:r,leftover:i}}var tp=class{renderer;w;h;canvas=document.createElement(`canvas`);yaw=.5;dragging=!1;scene=new gn;camera;rig=new lu;target;pixels;version=-1;constructor(e,t,n){this.renderer=e,this.w=t,this.h=n;let i=q.render;this.scene.add(new aa(i.skyLightColor,i.groundLightColor,i.hemiIntensity*1.1));let a=new Sa(i.sunColor,i.sunIntensity);a.position.set(2,4,5),this.scene.add(a,this.rig.root);let o=1.25,s=t/n*o;this.camera=new ba(-s,s,o,-1.25,.1,30),this.camera.position.set(0,1.6,10),this.camera.lookAt(0,1.12,0),this.target=new jt(t,n,{minFilter:r,magFilter:r}),this.target.texture.colorSpace=ze,this.pixels=new Uint8Array(t*n*4),this.rig.armL.rotation.z=-.18,this.rig.armR.rotation.z=.18}dispose(){this.target.dispose(),Xu(this.scene)}sync(e,t,n){n!==this.version&&(this.version=n,this.rig.applyAppearance(e),this.rig.setWeapons(t),this.rig.placeWeapons(null,!1))}render(e){this.dragging||(this.yaw+=e*.6),this.rig.root.rotation.y=this.yaw;let t=this.renderer,n=t.getRenderTarget(),r=t.getClearColor(new W),i=t.getClearAlpha();t.setRenderTarget(this.target),t.setClearColor(0,0),t.clear(),t.render(this.scene,this.camera),t.readRenderTargetPixels(this.target,0,0,this.w,this.h,this.pixels),t.setRenderTarget(n),t.setClearColor(r,i),Nl(this.pixels,this.w,this.h,this.canvas)}},np=26,rp=48,ip=72,ap=[[`hat`,`HAT`],[`neck`,`NECK`],[`top`,`TOP`],[`outerwear`,`COAT`]],op=[[`legs`,`LEGS`],[`belt`,`BELT`],[`holster`,`HOLS`],[`boots`,`BOOT`]],sp={w:rp,h:ip};function cp(e,t,n,r){let i=Math.floor((r-4)/3);return Array.from({length:3},(r,a)=>({kind:`slot`,holder:e,key:sf(a),label:String(a+1),x:t+a*(i+2),y:n,w:i,h:20}))}function lp(e,t,n){return{kind:`grid`,grid:e,cell:16,x:t,y:n,w:e.w*16,h:e.h*16}}function up(e,t,n,r){let i=128+r.w*16+6,a={x:Math.round((e-i)/2),y:Math.max(10,Math.round((t-153)/2)),w:i,h:153,title:`INVENTORY`},o=a.x+6,s=a.y+8,c=[];return ap.forEach(([e,t],r)=>c.push({kind:`slot`,holder:n,key:e,label:t,x:o,y:s+r*29,w:np,h:np})),op.forEach(([e,t],r)=>c.push({kind:`slot`,holder:n,key:e,label:t,x:o+np+8+rp,y:s+r*29,w:np,h:np})),c.push({kind:`preview`,x:o+np+4,y:s+21,w:rp,h:ip}),c.push(...cp(n,o,s+113+6,108)),c.push(lp(r,o+112+10,s)),{panels:[a],zones:c}}function dp(e,t,n,r,i){let a=Math.max(n.inventory.w,r.inventory.w)*16,o=Math.max(n.inventory.h,r.inventory.h)*16,s=6+a+6,c=8+o+6+20+6,l=Math.round((e-(s*2+14))/2),u=Math.max(10,Math.round((t-c)/2)),d={x:l,y:u,w:s,h:c,title:`YOU`},f={x:l+s+14,y:u,w:s,h:c,title:r.name.toUpperCase()},p=[lp(n.inventory,d.x+6,u+8),...cp(n.equipment,d.x+6,u+8+o+6,a),lp(r.inventory,f.x+6,u+8),{kind:`slot`,holder:r.equipment,key:`w0`,label:`GUN`,x:f.x+6,y:u+8+o+6,w:50,h:20},{kind:`button`,label:`TAKE ALL`,action:i,x:f.x+s-6-50,y:u+8+o+9,w:50,h:13}];return{panels:[d,f],zones:p}}var fp=31,pp=21;function mp(e,t,n,r,i,a){let o=n.inventory.w*16,s=n.inventory.h*16,c=6+o+6,l=8+s+6+20+6,u=Math.round((e-(c*2+14))/2),d=Math.max(16,Math.round((t-l)/2)+4),f={x:u,y:d,w:c,h:l,title:`YOU`},p={x:u+c+14,y:d,w:c,h:l,title:r.title.toUpperCase()},m=[lp(n.inventory,f.x+6,d+8),...cp(n.equipment,f.x+6,d+8+s+6,o)],h=r.wave(),g=Math.floor((c-8)/32),_=r.economy.available(1/0),v=Math.floor((l-10)/22),y=g*(_.length<=g*v?v:v-1),b=Math.max(1,Math.ceil(_.length/y)),x=Math.min(i,b-1);if(_.slice(x*y,(x+1)*y).forEach((e,t)=>{let n=p.x+5+t%g*32,r=d+8+Math.floor(t/g)*22;m.push({kind:`stock`,entry:e,locked:e.unlockWave>h,x:n,y:r,w:fp,h:pp})}),b>1){let e=p.y+p.h-17;m.push({kind:`button`,label:`<`,action:()=>a((x+b-1)%b),x:p.x+6,y:e,w:18,h:12}),m.push({kind:`button`,label:`${x+1}/${b}`,action:()=>a((x+1)%b),x:p.x+Math.round(p.w/2)-14,y:e,w:28,h:12}),m.push({kind:`button`,label:`>`,action:()=>a((x+1)%b),x:p.x+p.w-24,y:e,w:18,h:12})}return m.push({kind:`sell`,x:p.x,y:p.y,w:p.w,h:p.h}),{panels:[f,p],zones:m,wallet:{x:u+c*2+14-50,y:d-18,w:50,h:9},pages:b}}function hp(e,t,n,r,i){if(e.fillStyle=$.ink,e.fillRect(t.x-1,t.y-1,t.w+2,t.h+2),e.fillStyle=i?$.cellLine:$.cell,e.fillRect(t.x,t.y,t.w,t.h),Su(e,n.get(t.entry.item,8),t.x+1,t.y+1,t.w-2,t.h-8,!1,t.locked?.35:1),t.locked){let n=`W${t.entry.unlockWave}`;Q(e,n,t.x+t.w-Z(n)-1,t.y+t.h-6,$.woodPale)}else{let n=`$${t.entry.price}`;Q(e,n,t.x+Math.round((t.w-Z(n))/2),t.y+t.h-6,r?$.brassLight:$.rust)}t.entry.quantity>1&&Q(e,`${t.entry.quantity}`,t.x+1,t.y+1,$.cream,$.ink)}function gp(e,t,n){let r=`$${n}`,i=Z(r)+8,a=t.x+t.w-i;e.fillStyle=$.ink,e.fillRect(a-1,t.y-1,i+2,t.h+2),e.fillStyle=$.darkBrown,e.fillRect(a,t.y,i,t.h),Q(e,r,a+4,t.y+2,$.brassLight)}var _p={hat:`HAT`,top:`TOP`,legs:`LEGS`,fullBody:`FULL BODY`,outerwear:`OUTERWEAR`,neck:`NECK`,boots:`BOOTS`,belt:`BELT`,holster:`HOLSTER`},vp=class{host;mode=null;buying=null;preview;layout=null;drag=null;grab={dx:0,dy:0};previewDrag=null;time=0;constructor(e,t){this.host=e,this.preview=new tp(t,sp.w,sp.h)}dispose(){this.preview.dispose()}get open(){return this.mode!==null}openInventory(){this.mode={kind:`inventory`}}openLoot(e){this.mode={kind:`loot`,target:e}}openShop(e){this.mode={kind:`shop`,shop:e},this.shopPage=0}shopPage=0;close(){this.drag&&(Yf(this.drag),this.drag=null,this.changed()),this.previewDrag=null,this.buying=null,this.preview.dragging=!1,this.mode=null}escape(){this.buying?this.buying=null:this.drag?(Yf(this.drag),this.drag=null,this.changed()):this.close()}changed(){this.host.player.syncEquipment(),this.mode?.kind===`loot`&&this.mode.target.lootChanged()}buildLayout(e,t){let n=this.host.player;if(this.mode?.kind===`shop`){let r=mp(e,t,n,this.mode.shop,this.shopPage,e=>this.shopPage=e);return this.walletRect=r.wallet,r}if(this.mode?.kind===`loot`){let r=this.mode.target;return dp(e,t,n,r,()=>{ep(r.inventory,n.inventory,[{holder:r.equipment,key:`w0`}]).leftover&&this.host.toast(`Inventory full`),this.changed()})}return up(e,t,n.equipment,n.inventory)}walletRect={x:0,y:0,w:0,h:0};completePurchase(e,t,n,r,i){if(this.mode?.kind!==`shop`)return;let{economy:a}=this.mode.shop,o=this.host.player.inventory,s;if(n?.kind===`grid`){let e=Math.round((r-this.grab.dx-n.x)/n.cell),a=Math.round((i-this.grab.dy-n.y)/n.cell);s=r=>n.grid.place(r,e,a,t.rotated)||n.grid.place(r,e,a,!t.rotated)}else n?.kind===`slot`&&(s=e=>n.holder.accepts(n.key,e)&&!n.holder.get(n.key)&&n.holder.put(n.key,e,o));let c=a.buy(e,o,this.mode.shop.wave(),s),l=zl(e.item).name;c.ok?this.host.toast(`Bought ${l}  -$${e.price}`):c.reason===`funds`?this.host.toast(`Not enough money`):c.reason===`locked`?this.host.toast(`Available from wave ${e.unlockWave}`):this.host.toast(s?`No space there`:`No space in your bags`),this.changed()}zoneAt(e,t){return this.layout?.zones.find(n=>Fu(n,e,t))}dropTarget(e,t){let n=this.zoneAt(e,t);return n?.kind===`grid`?{kind:`grid`,grid:n.grid,x:Math.round((e-this.grab.dx-n.x)/n.cell),y:Math.round((t-this.grab.dy-n.y)/n.cell)}:n?.kind===`slot`?{kind:`slot`,holder:n.holder,key:n.key}:this.layout?.panels.some(n=>Fu({x:n.x-4,y:n.y-8,w:n.w+8,h:n.h+12},e,t))?null:{kind:`world`}}update(e,t,n,r,i){if(!this.mode)return;this.time+=e,this.layout=this.buildLayout(r,i);let{x:a,y:o}=t,s=this.host.player.inventory;if(this.buying&&n.rotate&&(this.buying.item.rotated=!this.buying.item.rotated),this.drag&&n.rotate){this.drag.item.rotated=!this.drag.item.rotated;let e=Nu(this.drag.item);this.grab={dx:e.w*16/2,dy:e.h*16/2}}if(this.previewDrag&&(this.preview.yaw=this.previewDrag.yaw0+(a-this.previewDrag.x0)*.05),t.secondary&&!this.drag){let e=this.zoneAt(a,o),t=e?.kind===`grid`?e.grid.at(Math.floor((a-e.x)/e.cell),Math.floor((o-e.y)/e.cell))?.item:null;if(t&&zl(t.defId).heal&&this.host.useItem){let e=this.host.useItem(t);e&&this.host.toast(e)}}if(t.pressed&&!this.drag){let e=this.zoneAt(a,o);if(e?.kind===`grid`){let t=Math.floor((a-e.x)/e.cell),r=Math.floor((o-e.y)/e.cell),i=e.grid.at(t,r);i&&(this.grab={dx:a-(e.x+i.x*e.cell),dy:o-(e.y+i.y*e.cell)},this.drag=n.shift?Jf(e.grid,t,r):qf({kind:`grid`,grid:e.grid,x:t,y:r}))}else if(e?.kind===`slot`){let t=e.holder.get(e.key);if(t){let n=Nu(t);this.grab={dx:n.w*16/2,dy:n.h*16/2},this.drag=qf({kind:`slot`,holder:e.holder,key:e.key}),this.changed()}}else if(e?.kind===`stock`&&this.mode.kind===`shop`){if(e.locked)this.host.toast(`Available from wave ${e.entry.unlockWave}`);else{let t=this.mode.shop.economy.makeItem(e.entry),n=Nu(t);this.grab={dx:n.w*16/2,dy:n.h*16/2},this.buying={entry:e.entry,item:t,from:e}}}else e?.kind===`button`?e.action():e?.kind===`preview`&&(this.previewDrag={x0:a,yaw0:this.preview.yaw},this.preview.dragging=!0)}if(t.released){if(this.previewDrag&&(this.previewDrag=null,this.preview.dragging=!1),this.buying){let e=this.buying;this.buying=null;let t=this.zoneAt(a,o);t?.kind===`stock`||t?.kind===`sell`?this.completePurchase(e.entry,e.item,void 0,a,o):(t?.kind===`grid`||t?.kind===`slot`&&t.holder===this.host.player.equipment)&&this.completePurchase(e.entry,e.item,t,a,o)}let e=this.mode?.kind===`shop`?this.layout.zones.find(e=>e.kind===`sell`):void 0;if(this.drag&&e&&Fu(e,a,o)&&this.mode?.kind===`shop`){let e=this.drag;this.drag=null;let t=this.mode.shop;if(t.buys&&!t.buys(e.item)){Yf(e),this.host.toast(`${t.merchantName} doesn't buy that`),this.changed();return}let n=this.mode.shop.economy.sell(e.item);e.splitFrom&&e.splitFrom.quantity<=0&&this.host.player.inventory.remove(e.splitFrom),this.host.toast(`Sold ${zl(e.item.defId).name}  +$${n}`),this.changed()}if(this.drag){let e=this.drag;this.drag=null;let t=this.dropTarget(a,o);if(t){let n=Zf(e,t,s);n.dropped&&this.host.dropToWorld(n.dropped)}else Yf(e);this.changed()}}}draw(e,t,n,r){if(!this.mode||!this.layout)return;let i=this.host.icons,a=this.host.player;e.fillStyle=`rgba(31,21,16,0.55)`,e.fillRect(0,0,t,n);for(let t of this.layout.panels)Iu(e,t,t.title);let o=!!a.equipment.clothing.legs&&Vl(zl(a.equipment.clothing.legs.defId))?.slot===`fullBody`,s=null,c=null;this.mode.kind===`shop`&&gp(e,this.walletRect,this.mode.shop.economy.wallet);for(let t of this.layout.zones)if(t.kind===`grid`)Lu(e,t,i,null),!this.drag&&Fu(t,r.x,r.y)&&(s=t.grid.at(Math.floor((r.x-t.x)/t.cell),Math.floor((r.y-t.y)/t.cell))?.item??null);else if(t.kind===`slot`)zu(e,t,i,null,t.key===`top`&&o&&t.holder===a.equipment),!this.drag&&Fu(t,r.x,r.y)&&(s=t.holder.get(t.key));else if(t.kind===`button`)Bu(e,t,Fu(t,r.x,r.y));else if(t.kind===`stock`)hp(e,t,i,((this.mode.kind===`shop`?this.mode.shop:null)?.economy.wallet??0)>=t.entry.price,Fu(t,r.x,r.y)),!this.drag&&!this.buying&&Fu(t,r.x,r.y)&&(c=t);else if(t.kind===`sell`){if(this.drag&&Fu(t,r.x,r.y)&&this.mode.kind===`shop`){let n=this.mode.shop,r=!n.buys||n.buys(this.drag.item);e.fillStyle=r?$.valid:$.invalid,e.fillRect(t.x,t.y,t.w,t.h);let i=r?`SELL +$${n.economy.sellValue(this.drag.item)}`:`DOESN'T BUY THAT`;Q(e,i,t.x+Math.round((t.w-Z(i))/2),t.y+t.h-9,$.brassLight,$.ink)}}else this.preview.sync(a.appearance(),a.equipment.weaponDefs(),a.equipment.version),this.preview.render(1/60),e.drawImage(this.preview.canvas,t.x,t.y);if(this.drag){let t=this.drag.item,n=Nu(t),o=this.dropTarget(r.x,r.y),s=this.zoneAt(r.x,r.y);if(o&&o.kind!==`world`&&s){if(e.fillStyle=Qf(this.drag,o,a.inventory)?$.valid:$.invalid,o.kind===`grid`&&s.kind===`grid`){let t=s.x+o.x*s.cell,r=s.y+o.y*s.cell,i=n.w*s.cell,a=n.h*s.cell,c=Math.max(t,s.x),l=Math.max(r,s.y);e.fillRect(c,l,Math.min(t+i,s.x+s.w)-c,Math.min(r+a,s.y+s.h)-l)}else e.fillRect(s.x,s.y,s.w,s.h)}let c=Math.round(r.x-this.grab.dx),l=Math.round(r.y-this.grab.dy);if(Ru(e,t,{x:c,y:l,w:n.w*16,h:n.h*16},i,.9),o?.kind===`world`){let t=`DROP`;Q(e,t,Math.round(r.x-Z(t)/2),l-7,$.brassLight,$.ink)}}else if(this.buying){let t=Nu(this.buying.item);Ru(e,this.buying.item,{x:Math.round(r.x-this.grab.dx),y:Math.round(r.y-this.grab.dy),w:t.w*16,h:t.h*16},i,.9)}else if(s){let i=this.tooltip(s);this.mode.kind===`shop`&&i.push({text:`SELLS FOR $${this.mode.shop.economy.sellValue(s)}`,color:$.brassLight}),Vu(e,i,r.x,r.y,t,n)}else if(c){let i=c.entry,a=this.tooltip({uid:0,defId:i.item,quantity:i.quantity,rotated:!1});a.splice(1,0,{text:c.locked?`FROM WAVE ${i.unlockWave}`:`PRICE $${i.price}`,color:c.locked?$.rust:$.brassLight}),Vu(e,a,r.x,r.y,t,n)}let l=this.layout.panels[this.layout.panels.length-1],u=this.layout.panels[0],d=this.mode.kind===`shop`?`CLICK OR DRAG TO BUY   DRAG ONTO MERCHANT TO SELL   E/ESC CLOSE`:this.mode.kind===`loot`?`DRAG ACROSS   R ROTATE   SHIFT SPLIT   DRAG OUT TO DROP   E/ESC CLOSE`:`R ROTATE   SHIFT SPLIT   DRAG OUT TO DROP   I/ESC CLOSE`;Q(e,d,Math.round((u.x+l.x+l.w)/2-Z(d)/2),Math.min(n-7,l.y+l.h+7),$.sand,$.ink),Uu(e,r.x,r.y)}tooltip(e){let t=zl(e.defId),n=[{text:t.name,color:$.brassLight}];for(let e of Hu(t.description.toUpperCase(),30))n.push({text:e});t.stackable&&n.push({text:`QUANTITY ${e.quantity}/${t.maxStack}`,color:$.sand});let r=Bl(t);if(r){let t=typeof r.pellets==`number`?r.pellets>1?` X${r.pellets}`:``:` X${r.pellets[0]}-${r.pellets[1]}`;n.push({text:`DAMAGE ${r.damage}${t}`,color:$.sand}),n.push({text:`FIRE RATE ${(1/r.fireInterval).toFixed(1)}/S`,color:$.sand}),n.push({text:`AMMO ${Ul(r.ammoType)?.name??r.ammoType}`,color:$.sand}),n.push({text:`LOADED ${e.loadedRounds??0}/${r.magazine}`,color:$.sand})}let i=Vl(t);return i&&n.push({text:`SLOT ${_p[i.slot]}`,color:$.sand}),n}},yp=new Set([`hat`,`boots`]),bp=class{item;position;object=new U;glint;range=2;priority=1;promptHeight=.9;onPickup=()=>{};body=new U;phase=Math.random()*10;constructor(e,t,n){this.item=e,this.position=t;let r=zl(e.defId),i=uu(r),a=Vl(r)?.slot;r.category===`ammo`||a!==void 0&&yp.has(a)||(i.rotation.x=-Math.PI/2),i.scale.setScalar(1.4),this.body.add(i),i.updateMatrixWorld(!0);let o=new jn().setFromObject(i),s=o.getCenter(new V);i.position.set(-s.x,.03-o.min.y,-s.z),this.body.rotation.y=Math.random()*Math.PI*2,this.object.add(this.body),this.object.position.copy(t),this.glint=new Pr(new xi(.07),n),this.glint.position.set(0,o.max.y-o.min.y+.12,0),this.glint.visible=!1,this.object.add(this.glint)}get label(){return`Pick up ${Pu(this.item)}`}canInteract(){return!0}interact(){this.onPickup(this)}update(e){this.phase+=e,this.body.position.y=Math.sin(this.phase*2.2)*.025+.025;let t=this.phase%2.4;this.glint.visible=t<.18,this.glint.scale.setScalar(t<.09?.6+t*6:1.14-(t-.09)*6),this.glint.rotation.y=this.phase*3}},xp=class{world;group=new U;glints=new U;items=[];glintMat=new Sr({color:J.white});constructor(e){this.world=e}spawn(e,t,n,r=1){let i=this.freeSpot(t,n,r),a=new bp(e,i,this.glintMat);return this.items.push(a),this.group.add(a.object),a.object.remove(a.glint),a.glint.position.add(i),this.glints.add(a.glint),a}remove(e){let t=this.items.indexOf(e);t<0||(this.items.splice(t,1),e.object.removeFromParent(),e.glint.removeFromParent())}update(e){for(let t of this.items)t.update(e)}freeSpot(e,t,n){for(let r of[n,n+.6,n+1.2,n+1.8])for(let n=0;n<12;n++){let i=t+(n%2?1:-1)*Math.ceil(n/2)*(Math.PI/6),a={x:e.x+Math.sin(i)*r,z:e.z+Math.cos(i)*r},o={...a};if(this.world.resolveCircle(a,.3),!(Math.hypot(a.x-o.x,a.z-o.z)>1e-4)&&!this.items.some(e=>Math.hypot(e.position.x-a.x,e.position.z-a.z)<.6))return new V(a.x,0,a.z)}return new V(e.x,0,e.z)}},Sp=new W(9101402),Cp=new W(16242548),wp=new W(16747068),Tp=new W(16727100),Ep=new W(5952255),Dp=new W(2117887),Op=new W(16777215),kp=class{world;group=new U;props=null;dynamic;trails=new Map;constructor(e){this.world=e,this.group.visible=!1;let t=new ur;this.dynamic=new li(t,new Zr({vertexColors:!0,depthTest:!1})),this.dynamic.frustumCulled=!1,this.dynamic.renderOrder=10,this.group.add(this.dynamic)}get visible(){return this.group.visible}toggle(){this.group.visible=!this.group.visible,this.group.visible&&!this.props&&this.buildProps()}buildProps(){let e=[],t=[],n=(n,r,i)=>{e.push(n.x,n.y,n.z,r.x,r.y,r.z),t.push(i.r,i.g,i.b,i.r,i.g,i.b)};for(let e of this.world.colliders){if(!e.blocksBullets)continue;let t=e.coverHeight,r=t<1.2?Sp:t<2.2?Cp:wp,i=e.base??0;if(e.kind===`box`){let a=[e.minX,e.maxX],o=[e.minZ,e.maxZ],s=[[0,0],[1,0],[1,1],[0,1]].map(([e,t])=>[a[e],o[t]]);s.forEach(([e,a],o)=>{let[c,l]=s[(o+1)%4];for(let o of[i,t])n(new V(e,o,a),new V(c,o,l),r);n(new V(e,i,a),new V(e,t,a),r)})}else this.cylinder(n,{x:e.x,z:e.z,r:e.r,y0:i,y1:t},r)}let r=new ur;r.setAttribute(`position`,new Qn(e,3)),r.setAttribute(`color`,new Qn(t,3)),this.props=new li(r,new Zr({vertexColors:!0})),this.props.frustumCulled=!1,this.group.add(this.props)}cylinder(e,t,n){for(let r=0;r<10;r++){let i=r/10*Math.PI*2,a=(r+1)/10*Math.PI*2;for(let r of[t.y0,t.y1])e(new V(t.x+Math.cos(i)*t.r,r,t.z+Math.sin(i)*t.r),new V(t.x+Math.cos(a)*t.r,r,t.z+Math.sin(a)*t.r),n);r%2==0&&e(new V(t.x+Math.cos(i)*t.r,t.y0,t.z+Math.sin(i)*t.r),new V(t.x+Math.cos(i)*t.r,t.y1,t.z+Math.sin(i)*t.r),n)}}update(e,t,n){if(!this.group.visible)return;let r=[],i=[],a=(e,t,n)=>{r.push(e.x,e.y,e.z,t.x,t.y,t.z),i.push(n.r,n.g,n.b,n.r,n.g,n.b)};for(let e of t)e&&this.cylinder(a,e,Tp);for(let t of this.trails.values())t.age+=e;for(let e of n){let t=this.trails.get(e),n=t?.points[t.points.length-1];(!t||n&&n.distanceTo(e)>4)&&(t={points:[],age:0},this.trails.set(e,t)),t.age=0,t.points.push(e.clone()),t.points.length>60&&t.points.shift(),a(e,new V(e.x,0,e.z),Op)}for(let[e,t]of this.trails)if(t.age>1.2)this.trails.delete(e);else for(let e=1;e<t.points.length;e++){let n=Dp.clone().lerp(Ep,Math.min(1,t.points[e].y/2));a(t.points[e-1],t.points[e],n)}let o=this.dynamic.geometry;o.setAttribute(`position`,new Qn(r,3)),o.setAttribute(`color`,new Qn(i,3)),o.computeBoundingSphere()}},Ap={dirt:[`dust`],wood:[`wood`,`spark`],rock:[`rock`,`spark`,`dust`],cactus:[`cactus`],metal:[`spark`,`spark`]},jp=class{engine;opts;hooks;scene=new gn;world;player=new Bf;horses=[];riding=null;projectiles=new Vf;particles=new Ff;flash=new tf;npcFlash=new tf;targets=new Wf;nav;npcs;ui;worldItems;coverDebug;map;timeScale=1;elapsed=0;deathMessage=`YOU DIED`;interactTarget=null;playerCollider;horseColliders=new Map;pausedAlpha=0;fireBlocked=!1;toast=null;sun;sunDir=new V(...q.render.sunDirection).normalize();accumulator=0;aim=new V;focusTarget=new V;footstepTimer=0;cursor=null;occluders;constructor(e,t,n){this.engine=e,this.opts=t,this.hooks=n;let r=e.pixelPass;r.unoutlined.length=0,r.normalPassExclude.length=0;let i=q.render;this.scene.background=new W(i.skyColor),this.scene.add(new aa(i.skyLightColor,i.groundLightColor,i.hemiIntensity)),this.sun=new Sa(i.sunColor,i.sunIntensity),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(i.shadowMapSize,i.shadowMapSize);let a=i.shadowExtent;Object.assign(this.sun.shadow.camera,{left:-a,right:a,top:a,bottom:-a,near:1,far:160}),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.02,this.scene.add(this.sun,this.sun.target);let o=t.map(this.targets);this.map=o,this.world=o.collision,this.occluders=o.occluders,this.scene.add(o.group,this.targets.group,this.projectiles.group,this.particles.mesh,this.flash.group,this.flash.light),this.scene.add(this.npcFlash.group,this.npcFlash.light),r.unoutlined.push(this.projectiles.group,this.flash.group,this.npcFlash.group,this.particles.mesh),this.player.setPosition(o.playerSpawn),this.player.regen=t.regen,this.playerCollider={kind:`circle`,x:0,z:0,r:q.player.radius,coverHeight:1.9,surface:`wood`,blocksBullets:!1},this.targets.addActor(this.player),this.scene.add(this.player.model.root),o.horseSpawn&&this.addHorse(new ef,o.horseSpawn,o.horseYaw),this.nav=new zd(this.world,o.half),this.npcs=new jf(t.npcs,this.world,this.nav,o.cover),this.scene.add(this.npcs.group);for(let e of this.npcs.npcs)this.registerNpc(e);this.coverDebug=new kp(this.world),this.scene.add(this.coverDebug.group),r.unoutlined.push(this.coverDebug.group),this.worldItems=new xp(this.world),this.scene.add(this.worldItems.group,this.worldItems.glints),r.unoutlined.push(this.worldItems.glints),this.ui=new vp({player:this.player,icons:e.icons,dropToWorld:e=>this.dropToWorld(e),toast:e=>this.showToast(e),useItem:e=>this.player.useItem(e)},e.renderer),e.rig.snapTo(this.player.pos)}registerNpc(e){this.targets.addActor(e),e.onLoot=e=>this.openUi(()=>this.ui.openLoot(e))}addHorse(e,t,n){return e.place(t,n),this.horses.push(e),this.scene.add(e.model.root),this.horseColliders.set(e,{kind:`circle`,x:t.x,z:t.z,r:q.horse.radius,coverHeight:2,surface:`wood`,blocksBullets:!1}),e.model.onFootfall=()=>{let t=e.model.root,n=new V(-Math.sin(t.rotation.y)*.7,.05,-Math.cos(t.rotation.y)*.7);this.particles.burst(`hoof`,n.add(t.position))},e.canMount=()=>!this.player.mounted&&!this.player.dead&&!e.ridden&&!e.riderNpc,e.onMount=()=>this.mount(e),e}removeHorse(e){let t=this.horses.indexOf(e);t<0||(this.riding===e&&this.dismount(),this.horses.splice(t,1),this.horseColliders.delete(e),e.model.root.removeFromParent(),Xu(e.model.root))}frame(e){if(this.engine.input.consume(`KeyB`)&&this.coverDebug.toggle(),this.handleMenuKeys(),this.ui.open){this.ui.update(e,this.engine.pointer(),{rotate:this.engine.input.consume(`KeyR`),shift:this.engine.input.sprint},this.engine.lowW,this.engine.lowH),this.render(e,!0);return}let t=q.sim.fixedDt;this.accumulator+=e*this.timeScale;let n=0;for(;this.accumulator>=t&&n<q.sim.maxStepsPerFrame&&(this.update(t),this.accumulator-=t,n++,!this.ui.open););n===q.sim.maxStepsPerFrame&&(this.accumulator=0),this.pausedAlpha=this.accumulator/t,this.render(e*this.timeScale,!1)}escape(){return this.ui.open?(this.ui.escape(),this.ui.open||this.closeUi(),!0):!1}handleMenuKeys(){let e=this.engine.input,t=this.ui.open;e.consume(`KeyI`)?t?this.closeUi():this.player.dead||this.openUi(()=>this.ui.openInventory()):t&&this.ui.mode?.kind!==`inventory`&&e.consume(`KeyE`)&&this.closeUi()}openUi(e){e(),this.engine.input.clearPressed()}closeUi(){this.ui.close(),this.engine.input.clearPressed(),this.fireBlocked=this.engine.input.mouseDown}dropToWorld(e,t){let n=this.player,r=this.worldItems.spawn(e,t??n.pos,n.aimYaw,n.mounted?1.7:1);return r.onPickup=e=>this.pickUp(e),r}pickUp(e){let t=e.item.quantity,n=$f(this.player.inventory,e.item);n===0?this.worldItems.remove(e):(this.showToast(`Inventory full`),n<t&&(e.item.quantity=n)),this.player.syncEquipment()}showToast(e,t=2){this.toast={text:e,left:t}}update(e){this.elapsed+=e;let t=this.engine.input;this.updateAim();let n=this.engine.rig,r=t.moveAxes(),i=n.screenRightGround.x*r.x+n.screenUpGround.x*r.y,a=n.screenRightGround.z*r.x+n.screenUpGround.z*r.y,o=Math.hypot(i,a);o>1e-6&&(i/=o,a/=o);let s=this.player;s.update(e),t.mouseDown||(this.fireBlocked=!1);let c=[...this.horses,...this.npcs.npcs,...this.worldItems.items,...this.hooks.interactables?.()??[]];if(this.interactTarget=s.mounted||s.dead?null:Kf(c,s.pos,s.aimYaw),t.consume(`KeyE`)&&!s.dead&&(s.mounted?this.dismount():this.interactTarget?.interact()),t.consume(`KeyG`)){let e=s.useBandage();e&&this.showToast(e)}let l={moveX:i,moveZ:a,sprint:t.sprint,fireHeld:t.mouseDown&&!s.dead&&!this.fireBlocked,reload:t.consume(`KeyR`)&&!s.dead,holster:t.consume(`KeyH`),select:this.slotKey(),crouch:t.consume(`KeyC`),aim:this.aim},u=this.npcs.bodies;for(let n of this.horses){let r=[...u,...this.otherHorseColliders(n)];if(n===this.riding)n.update(e,o>1e-6?yl(i,a):null,t.sprint,this.world,r);else if(n.driver){let t=n.driver(e);n.update(e,t.target,t.gallop,this.world,r)}else n.update(e,null,!1,this.world,r);let s=this.horseColliders.get(n);s.x=n.pos.x,s.z=n.pos.z}this.riding?(s.prevPos.copy(s.pos),s.pos.copy(this.riding.pos),s.mountSpeed=this.riding.motor.speed,s.mountYaw=this.riding.heading):(s.updateMovement(e,l,this.world,[...this.otherHorseColliders(null),...u]),this.spawnFootsteps(e)),this.playerCollider.x=s.pos.x,this.playerCollider.z=s.pos.z;let d=s.updateWeapon(e,l);d&&(this.fireShot(d,s,this.flash),n.addTrauma(q.shake.shotTrauma));let f=[...this.otherHorseColliders(null)];!s.mounted&&!s.dead&&f.push(this.playerCollider),this.npcs.update(e,s,f,(e,t)=>this.fireShot(t,e,this.npcFlash)),this.projectiles.update(e,this.world,this.targets,e=>this.onImpact(e)),this.updateDeath(),this.targets.update(e),this.particles.update(e),this.flash.update(e),this.npcFlash.update(e),this.hooks.step?.(e)}otherHorseColliders(e){let t=[];for(let n of this.horses)n!==e&&n!==this.riding&&t.push(this.horseColliders.get(n));return t}updateAim(){let e=this.engine.renderer.domElement.getBoundingClientRect(),t=this.engine.input,n=(t.mouseX-e.left)/e.width,r=(t.mouseY-e.top)/e.height;this.pickAim(n*2-1,-(r*2-1),this.aim),this.cursor=t.mouseInside?{x:Math.floor(n*this.engine.lowW),y:Math.floor(r*this.engine.lowH)}:null}slotKey(){let e=null;return[`Digit1`,`Digit2`,`Digit3`].forEach((t,n)=>{this.engine.input.consume(t)&&e===null&&(e=n)}),e}aimFrom=new V;aimTo=new V;pickAim(e,t,n){let r=this.engine.rig.pickRay(e,t),i=this.aimFrom.copy(r.origin),a=this.aimTo.copy(r.origin).addScaledVector(r.direction,-r.origin.y/r.direction.y+1);for(let e=0;e<4;e++){let e=this.world.raycast(i.x,i.y,i.z,a.x,a.y,a.z),t=this.targets.raycast(i,a,this.player);if(t&&(!e||t.t<=e.t)){n.copy(i).lerp(a,t.t);return}if(!e)break;if(n.copy(i).lerp(a,e.t),!e.collider||!this.isFadedAt(n.x,n.z))return;i.copy(n).addScaledVector(r.direction,.05)}n.copy(r.origin).addScaledVector(r.direction,-r.origin.y/r.direction.y)}isFadedAt(e,t){let n=.05;return this.occluders.some(r=>r.fade.value>.3&&e>r.minX-n&&e<r.maxX+n&&t>r.minZ-n&&t<r.maxZ+n)}fireShot(e,t,n){for(let n of e.dirs)this.projectiles.fire(e.origin,n,e.weapon,t);let r=e.dirs[0];n.trigger(e.origin,r),this.particles.spawn(e.origin.x,e.origin.y,e.origin.z,r.x*1.5,.6,r.z*1.5,.35,.16,.5,e.dirs.length>1?5:3,15257499)}updateDeath(){let e=this.player;e.dead||e.hp>0||(e.mounted&&this.dismount(),e.holster(!0),e.crouched=!1,e.dead=!0,e.vel.set(0,0),this.hooks.onPlayerDeath())}revivePlayer(e,t){this.player.revive(t??this.player.pos.clone(),e)}mount(e){let t=this.player;t.cancelCrouch(),t.mounted=!0,e.ridden=!0,e.driver=null,this.riding=e,t.vel.set(0,0),e.model.saddle.add(t.model.root),t.model.root.position.set(0,0,0),t.setPosition(e.pos)}dismount(){let e=this.player,t=this.riding;if(!t)return;let n=t.heading,r=[[Math.cos(n),-Math.sin(n)],[-Math.cos(n),Math.sin(n)],[-Math.sin(n),-Math.cos(n)]],i=r[0];for(let e of r){let n={x:t.pos.x+e[0]*1.3,z:t.pos.z+e[1]*1.3},r={...n};if(this.world.resolveCircle(n,q.player.radius),Math.hypot(n.x-r.x,n.z-r.z)<1e-4){i=e;break}}e.mounted=!1,t.ridden=!1,this.riding=null,e.setPosition(new V(t.pos.x+i[0]*1.3,0,t.pos.z+i[1]*1.3)),e.vel.set(Math.sin(n)*t.motor.speed*.3,Math.cos(n)*t.motor.speed*.3),this.scene.add(e.model.root),e.model.root.rotation.set(0,0,0),this.particles.burst(`dust`,e.pos.clone().setY(.1))}spawnFootsteps(e){this.player.speed()<1||(this.footstepTimer-=e,this.footstepTimer<=0&&(this.footstepTimer=this.player.sprinting?.2:.32,this.particles.burst(`hoof`,this.player.pos.clone().setY(.05),void 0,this.player.sprinting?.8:.5)))}onImpact(e){let t=e.shooter===this.player,n=e.target instanceof Af?e.target:null,r=n?.alive??!1;if(t&&(n?.alive&&this.npcs.onPlayerHitNpc(n,this.player),this.npcs.onPlayerShotLanded(e.point,n)),e.target){let i=e.target.hit(e.point,e.dir,{damage:e.damage,shooter:e.shooter});this.particles.burst(i,e.point,e.dir.clone().multiplyScalar(.6).add(e.normal)),i!==`blood`&&this.particles.burst(`spark`,e.point,e.normal,.5),e.target===this.player&&this.engine.rig.addTrauma(.35),n&&r&&!n.alive&&this.hooks.onNpcDeath?.(n,t)}else(e.surface===`target`?[`dust`]:Ap[e.surface]).forEach((t,n)=>this.particles.burst(t,e.point,e.normal,n===0?1:.6)),e.surface===`dirt`&&this.particles.burst(`dust`,e.point,e.normal,.6)}render(e,t){let n=this.engine,r=n.rig;n.renderer.info.reset();let i=this.pausedAlpha,a=this.player,o=t?0:e;for(let e of this.horses)e.sync(i,o);a.mounted||a.model.root.position.lerpVectors(a.prevPos,a.pos,i),a.animate(o),a.model.root.visible=a.invulnerable<=0||Math.floor(a.invulnerable*12)%2==0;for(let e of this.npcs.npcs)e.sync(i,o);this.projectiles.sync(i),this.worldItems.update(o);let s=this.riding?this.riding.model.root.position:a.model.root.position,c=q.camera,l=this.focusTarget.set(this.aim.x-s.x,0,this.aim.z-s.z).multiplyScalar(c.aimLead);if(l.length()>c.maxAimLead&&l.setLength(c.maxAimLead),this.riding){let e=this.riding.motor;l.x+=Math.sin(e.heading)*e.speed*.18,l.z+=Math.cos(e.heading)*e.speed*.18}l.add(s).setY(0),r.update(o,l,n.pixelate),this.updateSun(),this.updateOccluders(o,s,a.mounted),this.coverDebug.update(o,this.targets.actors.map(e=>e.hitbox?.()??null),this.projectiles.live()),n.renderScene(this.scene),this.toast&&(this.toast.left-=e,this.toast.left<=0&&(this.toast=null));let u=a.weapon,d=t||this.ui.open;n.hud.draw(e,{weaponBar:{slots:a.equipment.weapons.map((e,t)=>({icon:e?n.icons.get(e.defId,8):null,selected:a.active===t})),drawn:a.drawn,ammo:u?{loaded:u.ammo,magazine:u.def.magazine,reserve:u.reserve}:null,reloadProgress:a.reloadProgress,noAmmo:a.noAmmo>0,stance:a.mounted?null:a.crouched?`crouch`:`stand`},toast:this.toast?.text??null,menuOpen:d,hp:a.hp,maxHp:q.player.maxHp,healProgress:a.healProgress,hurt:a.hurt,dead:a.dead,deathMessage:this.deathMessage,labels:d?[]:this.worldLabels(),prompt:this.opts.tutorial&&this.elapsed<9?this.opts.tutorial:null,cursorX:this.cursor?.x??null,cursorY:this.cursor?.y??null,mounted:a.mounted,speedLabel:this.riding?this.gaitLabel(this.riding):null,pixelate:n.pixelate});let f=n.hud.context;this.hooks.drawHud?.(f,n.lowW,n.lowH,t?0:e),this.ui.open&&this.ui.draw(f,n.lowW,n.lowH,n.uiPointer),n.debug.draw(e,r.view,this.riding??this.horses[0]??null,[`low-res ${n.lowW}x${n.lowH} x${n.scale}  pixel ${n.pixelate?`on`:`off`}  palette ${n.pixelPass.quantize?`on`:`off`} [O]  outlines [L]`,`player ${a.pos.x.toFixed(1)}, ${a.pos.z.toFixed(1)}  ${a.mounted?`mounted`:`on foot`}  ammo ${a.ammo}`,`draw calls ${n.renderer.info.render.calls}  geometries ${n.renderer.info.memory.geometries}  textures ${n.renderer.info.memory.textures}`,`npcs ${this.npcs.npcs.map(e=>`${e.name.split(` `)[0]}:${e.mode}${e.mode!==`routine`&&e.alive?` ${e.calmTimer.toFixed(0)}s`:``}`).join(`  `)}`])}projected=new V;project=(e,t,n)=>{let r=this.projected.set(e,t,n).project(this.engine.rig.view);return{x:(r.x+1)/2*this.engine.lowW,y:(1-r.y)/2*this.engine.lowH}};worldLabels(){let e=[],t=this.interactTarget;for(let n of this.npcs.npcs){if(!n.alive)continue;let r=n.model.root.getWorldPosition(this.labelPos),i=this.project(r.x,r.y+2.15,r.z),a=i.y;t===n&&(e.push({kind:`name`,text:n.name,x:i.x,y:a}),e.push({kind:`prompt`,text:`[E] ${t.label}`,x:i.x,y:a-10}),a-=18),n.telegraphing&&(e.push({kind:`alert`,text:`!`,x:i.x,y:a}),a-=8),n.speech&&e.push({kind:`speech`,text:n.speech,x:i.x,y:a})}if(t&&!(t instanceof Af&&t.alive)){let n=this.project(t.position.x,t.promptHeight,t.position.z);e.push({kind:`prompt`,text:`[E] ${t.label}`,x:n.x,y:n.y})}return this.hooks.labels&&e.push(...this.hooks.labels(this.project)),e}labelPos=new V;updateOccluders(e,t,n){let r=this.engine.rig,i=r.back,a=this.engine.pixelPass.normalPassExclude;a.length=0;for(let o of this.occluders){let s=!1;for(let[e,a]of n?[[0,.6],[0,2.4],[1,1.4],[-1,1.4]]:[[0,.3],[0,1],[0,1.8]]){let n=t.x+r.right.x*e,c=t.z+r.right.z*e;if(fd(n,a,c,n+i.x*40,a+i.y*40,c+i.z*40,o.minX,o.minZ,o.maxX,o.maxZ,o.height)){s=!0;break}}o.fade.value=pl(o.fade.value,s?.72:0,10,e),o.fade.value<.01&&(o.fade.value=0),o.mesh.renderOrder=+(o.fade.value>0),o.fade.value>.05&&a.push(o.mesh)}}gaitLabel(e){let t=e.motor;return t.mode===`braking`?`WHOA!`:t.speed<.1?`STAND`:t.speed<3.5?`WALK`:t.speed<q.horse.canterSpeed+.5?`CANTER`:`GALLOP`}lightRight=new V;lightUp=new V;updateSun(){let e=2*q.render.shadowExtent/q.render.shadowMapSize;this.lightRight.crossVectors(cn.DEFAULT_UP,this.sunDir).normalize(),this.lightUp.crossVectors(this.sunDir,this.lightRight).normalize();let t=this.engine.rig.focus,n=t.dot(this.lightRight),r=t.dot(this.lightUp),i=Math.round(n/e)*e-n,a=Math.round(r/e)*e-r,o=this.sun.target.position.copy(t).addScaledVector(this.lightRight,i).addScaledVector(this.lightUp,a);this.sun.position.copy(o).addScaledVector(this.sunDir,80),this.sun.target.updateMatrixWorld()}dispose(){this.ui.open&&this.ui.close(),this.ui.dispose(),this.sun.shadow.map?.dispose(),Xu(this.scene),this.scene.clear(),this.engine.pixelPass.unoutlined.length=0,this.engine.pixelPass.normalPassExclude.length=0,this.engine.input.clearPressed()}},Mp=q.world.size/2;function Np(e){let t=new bl(q.world.seed),n=new U,r=new ad,i=new sd(Mp),a=[],o=[],s=(e,t,n)=>o.push({x:e,z:t,r:n}),c=(e,t,n)=>o.every(r=>Math.hypot(r.x-e,r.z-t)>r.r+n);n.add(md(Fp));let l=[[-14,7,7,3.6,J.woodLight,J.cream],[-5,8,8,5.4,J.wood,J.red],[3.5,6,7,3.4,J.woodPale,J.darkBrown],[12,7,7,3.8,J.red,J.cream],[20.5,6,6,3.2,J.woodLight,J.rust]],u=[[-10,7,7,3.8,J.wood,J.cream],[-1,6,6,3.4,J.sandDark,J.darkBrown],[8,8,8,5,J.woodPale,J.rust]];for(let[e,n,r,o,s,c]of l)a.push(hd(i,e,-6.5-r/2,0,n,r,o,s,c,t));for(let[e,n,r,o,s,c]of u)a.push(hd(i,-19.5-r/2,e,Math.PI/2,n,r,o,s,c,t));for(let e of a)n.add(e.mesh);Sd(r,i,7,-21),yd(r,i,-3.5,5.6),yd(r,i,16,5.6),bd(r,i,-9.5,5.3),bd(r,i,7.5,5.3),bd(r,i,-15.6,-4.8),xd(r,i,1,9.5);for(let[e,n]of[[-18.2,-5],[-9.7,-4.4],[-.6,-5.2],[7.2,-4.3],[16.4,-5.1],[24.2,-4.6],[-12.8,6],[-6.4,6.4],[3.4,6.2],[11,5.9],[19.6,6.5],[-17.2,11.2],[-16.8,-12.3]])_d(r,i,e,n,t);for(let[e,n]of[[-11.8,6.8],[20.8,6],[24.6,-6],[-17,4.8],[-17.6,12.4]])vd(r,i,e,n,t);gd(r,i,-14,9,-6,9),gd(r,i,9,9,19,9);let d=[...gd(r,i,27,-9,27,-2),...gd(r,i,27,2,27,9)],f=gd(r,i,27,-11,41,-11);for(let n of[...d,...f])t.next()<.85&&e.addBottle(n,t.pick([J.glass,J.glassBrown,J.cactus]));for(let t of[-6,-3,3,6])e.addDummy(new V(31,0,t),Math.PI/2),i.addCircle(31,t,.3,1.9,`wood`,!1);[...gd(r,i,-40,14,-30,14),...gd(r,i,-40,14,-40,26),...gd(r,i,-40,26,-30,26)].forEach((n,r)=>r%3==0&&e.addBottle(n,t.pick([J.glass,J.glassBrown])));let p=(e,t)=>e>-29&&e<27&&t>-25&&t<12||e>24&&e<44&&Math.abs(t)<14||e>-43&&e<-27&&t>11&&t<29,m=(e,n,r)=>{let i=0,a=0;for(;a<e&&i++<e*40;){let e=t.range(-Mp+2,Mp-2),i=t.range(-Mp+2,Mp-2);!p(e,i)&&c(e,i,n)&&(s(e,i,n),r(e,i),a++)}};m(46,1.6,(e,n)=>Cd(r,i,e,n,t)),m(34,1.8,(e,n)=>wd(r,i,e,n,t)),m(40,.8,(e,n)=>Td(r,e,n,t));for(let[e,n]of[[-24,14],[25,13],[26,-16],[-27,-18]])Cd(r,i,e,n,t);return Ed(r,t,Mp),n.add(r.build()),{group:n,collision:i,occluders:a,cover:a,half:Mp,playerSpawn:new V(-2,0,1.5),horseSpawn:new V(-6.5,0,2.6),horseYaw:Math.PI/2}}var Pp=new Map;function Fp(e,t,n,r){let i=`${e},${t}`;if(!r&&Pp.has(i))return Pp.get(i);let a=xl(e*.07,t*.07,3)*.7+xl(e*.23,t*.23,7)*.3,o=a<.3?J.sandDark:a<.64?J.sand:J.sandLight,s=n.next();return s<.015?o=J.sandPale:s<.03&&(o=J.sandDark),(Math.abs(t)<4.6&&e>-19.5&&e<30||e>-19.5&&e<-13.5&&t>-14&&t<14)&&(o=a<.5?11569752:J.sandDark,Math.abs(Math.abs(t)-1.6)<.5&&s<.7&&(o=9333830)),e>26&&e<44&&Math.abs(t)<2&&s<.6&&(o=11569752),(Math.abs(e)>Mp||Math.abs(t)>Mp)&&(o=a<.5?J.sandDark:J.sand),Pp.set(i,o),o}var Ip=[{item:`ammo_revolver`,price:12,quantity:18,unlockWave:1},{item:`ammo_rifle`,price:16,quantity:10,unlockWave:1},{item:`ammo_shells`,price:14,quantity:6,unlockWave:1},{item:`bandage`,price:20,quantity:1,unlockWave:1},{item:`revolver`,price:60,quantity:1,unlockWave:1},{item:`rifle`,price:120,quantity:1,unlockWave:2},{item:`shotgun`,price:150,quantity:1,unlockWave:4},...[`cowboy_hat_tan`,`cowboy_hat_black`,`duster_sand`,`duster_black`,`vest_brown`,`bandana_black`,`chaps_wood`,`boots_black`,`shirt_denim`].map(e=>({item:e,price:El[e].slot===`outerwear`?40:25,quantity:1,unlockWave:1}))],Lp={hat:25,top:18,outerwear:40,legs:28,fullBody:45,boots:30,neck:10,belt:15,holster:20},Rp={gunsmith:{title:`GUNS & AMMO`,stock:[{item:`revolver`,price:60,quantity:1,unlockWave:1},{item:`rifle`,price:120,quantity:1,unlockWave:1},{item:`shotgun`,price:150,quantity:1,unlockWave:1},{item:`ammo_revolver`,price:12,quantity:18,unlockWave:1},{item:`ammo_rifle`,price:16,quantity:10,unlockWave:1},{item:`ammo_shells`,price:14,quantity:6,unlockWave:1},{item:`bandage`,price:20,quantity:1,unlockWave:1}],buys:[`weapon`,`ammo`,`consumable`]},tailor:{title:`CLOTHIER`,stock:Object.values(El).map(e=>({item:e.id,price:Lp[e.slot],quantity:1,unlockWave:1})),buys:[`clothing`]}};function zp(e,t,n,r,i){let a=Z(t)+8,o=Math.round(n-a/2);e.fillStyle=`rgba(31,21,16,0.65)`,e.fillRect(o,r,a,9),Q(e,t,o+4,r+2,i)}function Bp(e,t,n,r,i){r.phase===`active`?zp(e,`WAVE ${r.wave}   ${r.enemiesLeft} LEFT`,t/2,3,$.cream):r.phase===`countdown`?zp(e,`WAVE ${r.wave} IN ${Math.ceil(r.timer)}`,t/2,3,$.brassLight):(zp(e,`NEXT WAVE IN ${Math.ceil(r.timer)}`,t/2,3,$.cream),Math.floor(i*2)%2==0&&zp(e,`ENTER: SKIP   E: TRADE AT THE WAGON`,t/2,13,$.sand)),Vp(e,t,r.wallet),r.pops.forEach((n,r)=>{n.age>1.6||Q(e,n.text,t-Z(n.text)-5,15+r*7-Math.round(n.age*4),$.green,$.ink)});let a=r.reviveTokens>0?$.brassLight:$.leather;e.fillStyle=$.ink,e.fillRect(61,3,9,9),e.fillStyle=a;for(let[t,n,r,i]of[[3,0,1,7],[0,3,7,1],[2,1,3,5],[1,2,5,3]])e.fillRect(62+t,4+n,r,i);r.reviveTokens>0&&Q(e,`x${r.reviveTokens}`,71,5,$.cream,$.ink);for(let i of r.pointers){if(i.x>=0&&i.y>=0&&i.x<t&&i.y<n)continue;let r=Math.max(6,Math.min(t-7,i.x)),a=Math.max(22,Math.min(n-30,i.y)),o=Math.atan2(i.y-n/2,i.x-t/2);e.fillStyle=$.red;for(let t=0;t<4;t++){let n=Math.round(r+Math.cos(o)*t),i=Math.round(a+Math.sin(o)*t),s=3-t;e.fillRect(n-s,i-s,s*2+1,s*2+1)}}if(r.banner&&r.banner.alpha>0){e.save(),e.globalAlpha=Math.min(1,r.banner.alpha);let i=t>=420?4:3,a=yu(r.banner.text,i),o=Math.round(n*.24);vu(e,r.banner.text,Math.round((t-a)/2),o,$.brassLight,i,$.ink),r.banner.sub&&Q(e,r.banner.sub,Math.round((t-Z(r.banner.sub))/2),o+6*i+4,$.cream,$.ink),e.restore()}}function Vp(e,t,n){let r=`$${n}`,i=Z(r)+8;e.fillStyle=`rgba(31,21,16,0.65)`,e.fillRect(t-i-3,3,i,9),Q(e,r,t-i+1,5,$.brassLight)}var Hp={killReward:{gunslinger:15,rifleman:20,shotgunner:18},mountedBonus:10,waveBonusBase:20,waveBonusPerWave:10,sellFraction:.5,fallbackPrice:{weapon:60,ammo:10,clothing:20,consumable:10}},Up={hat:[`cowboy_hat_black`,`cowboy_hat_dark`,`cowboy_hat_brown`],top:[`shirt_grey`,`shirt_denim`,`shirt_rust`],outerwear:[`duster_dark`,`duster_black`,`vest_brown`,null],neck:[`bandana_black`,`bandana_rust`,`bandana_red`],legs:[`chaps_dark`,`chaps_wood`,`trousers_brown`],boots:[`boots_black`,`boots_brown`],belt:[`belt_leather`]},Wp={gunslinger:{id:`gunslinger`,weapon:`revolver`,mountedWeapon:`revolver`,tactics:`strafe`,hp:90,inaccuracy:2.4,reactionTime:.32,ammoBoxes:[2,3],wardrobe:{...Up,holster:[`holster_leather`]}},rifleman:{id:`rifleman`,weapon:`rifle`,mountedWeapon:null,tactics:`cover`,hp:80,inaccuracy:2.2,reactionTime:.4,ammoBoxes:[2,3],wardrobe:Up},shotgunner:{id:`shotgunner`,weapon:`shotgun`,mountedWeapon:`shotgun`,tactics:`rush`,hp:110,inaccuracy:1.2,reactionTime:.35,ammoBoxes:[2,3],wardrobe:Up}},Gp=[J.skin,J.skinDark,12880486],Kp=[J.ink,J.darkBrown,J.brown,J.woodLight];function qp(e,t=Math.random){let n=e=>e[Math.floor(t()*e.length)],r={};for(let[t,i]of Object.entries(e.wardrobe)){let e=n(i);e&&(r[t]=e)}return{body:`male`,skin:n(Gp),hair:n(Kp),hairStyle:t()<.25?`long`:`short`,beard:t()<.7?n(Kp):void 0,clothing:r}}var Jp=[{count:3,mix:{gunslinger:1},mounted:0,hp:.8,accuracy:1.25,reaction:1.25},{count:4,mix:{gunslinger:3,rifleman:1},mounted:0,hp:.85,accuracy:1.2,reaction:1.2},{count:5,mix:{gunslinger:3,rifleman:1,shotgunner:1},mounted:0,hp:.9,accuracy:1.1,reaction:1.1},{count:6,mix:{gunslinger:3,rifleman:2,shotgunner:1},mounted:0,hp:1,accuracy:1.05,reaction:1.05},{count:7,mix:{gunslinger:3,rifleman:2,shotgunner:2},mounted:.2,hp:1,accuracy:1,reaction:1},{count:8,mix:{gunslinger:3,rifleman:2,shotgunner:2},mounted:.25,hp:1.05,accuracy:.97,reaction:.97},{count:9,mix:{gunslinger:3,rifleman:2,shotgunner:3},mounted:.3,hp:1.1,accuracy:.94,reaction:.95},{count:10,mix:{gunslinger:3,rifleman:3,shotgunner:3},mounted:.35,hp:1.15,accuracy:.9,reaction:.92}],Yp={countPerWave:1.5,maxCount:30,mountedPerWave:.03,maxMounted:.6,hpPerWave:.06,accuracyPerWave:.02,minAccuracy:.6,reactionPerWave:.02,minReaction:.6};function Xp(e){if(e<=Jp.length)return Jp[Math.max(1,e)-1];let t=Jp[Jp.length-1],n=e-Jp.length,r=Yp;return{count:Math.min(r.maxCount,Math.round(t.count+n*r.countPerWave)),mix:t.mix,mounted:Math.min(r.maxMounted,t.mounted+n*r.mountedPerWave),hp:t.hp+n*r.hpPerWave,accuracy:Math.max(r.minAccuracy,t.accuracy-n*r.accuracyPerWave),reaction:Math.max(r.minReaction,t.reaction-n*r.reactionPerWave)}}function Zp(e,t){let n=Object.keys(t),r=n.reduce((e,n)=>e+(t[n]??0),0),i={gunslinger:0,rifleman:0,shotgunner:0},a=[],o=0;for(let s of n){let n=e*(t[s]??0)/r;i[s]=Math.floor(n),o+=i[s],a.push([s,n-i[s]])}a.sort((e,t)=>t[1]-e[1]);for(let t=0;o<e;t++,o++)i[a[t%a.length][0]]++;return i}function Qp(e,t=Math.random){let n=Xp(e),r=Zp(n.count,n.mix),i=[];for(let e of Object.keys(r))for(let t=0;t<r[e];t++)i.push({archetype:e,mounted:!1,hp:n.hp,accuracy:n.accuracy,reaction:n.reaction});if(e>=q.wave.mountedEnemiesFromWave&&n.mounted>0){let e=Math.round(n.count*n.mounted);for(let t of i){if(e<=0)break;Wp[t.archetype].mountedWeapon&&(t.mounted=!0,e--)}}for(let e=i.length-1;e>0;e--){let n=Math.floor(t()*(e+1));[i[e],i[n]]=[i[n],i[e]]}return{wave:e,enemies:i}}function $p(e){return Hp.waveBonusBase+Hp.waveBonusPerWave*e}var em=class{rand;phase=`countdown`;wave;timer=0;sinceCleared=1/0;queue=[];spawnTimer=0;spawned=0;constructor(e=1,t=Math.random){this.rand=t,this.wave=Math.max(1,e)}start(){return this.beginCountdown()}get pending(){return this.queue.length}beginCountdown(){return this.phase=`countdown`,this.timer=q.wave.countdown,[{type:`countdown`,wave:this.wave}]}update(e,t,n=!1){let r=[];if(this.sinceCleared+=e,this.phase===`countdown`)this.timer-=e,this.timer<=0&&(this.phase=`active`,this.queue=Qp(this.wave,this.rand).enemies,this.spawned=0,this.spawnTimer=0,r.push({type:`waveStart`,wave:this.wave,count:this.queue.length}));else if(this.phase===`active`){this.spawnTimer-=e;let n=!1;if(this.queue.length>0&&this.spawnTimer<=0){r.push({type:`spawn`,wave:this.wave,enemy:this.queue.shift()}),this.spawned++,n=!0;let[e,t]=q.wave.spawnInterval;this.spawnTimer=e+this.rand()*(t-e)}!n&&this.queue.length===0&&t===0&&this.spawned>0&&(r.push({type:`waveCleared`,wave:this.wave,bonus:$p(this.wave)}),this.sinceCleared=0,this.phase=`intermission`,this.timer=q.wave.intermission,this.wave===q.wave.horseUnlockWave&&r.push({type:`horseArrives`}),this.wave-q.wave.corpseWaves>=1&&r.push({type:`despawnCorpses`,upToWave:this.wave-q.wave.corpseWaves}))}else n||(this.timer-=e,this.timer<=0&&(this.wave++,r.push(...this.beginCountdown())));return r}skipIntermission(){return this.phase===`intermission`?(this.wave++,this.beginCountdown()):[]}},tm=class{stock;purse;constructor(e=Ip,t={dollars:0,earned:0}){this.stock=e,this.purse=t}get wallet(){return this.purse.dollars}set wallet(e){this.purse.dollars=e}get earned(){return this.purse.earned}killReward(e,t){return Hp.killReward[e]+(t?Hp.mountedBonus:0)}waveBonus(e){return $p(e)}earn(e){this.purse.dollars+=e,this.purse.earned+=e}entry(e){return this.stock.find(t=>t.item===e)}available(e){return this.stock.filter(t=>t.unlockWave<=e)}makeItem(e){return Mu(e.item,e.quantity)}buy(e,t,n,r){if(e.unlockWave>n)return{ok:!1,reason:`locked`};if(this.wallet<e.price)return{ok:!1,reason:`funds`};let i=this.makeItem(e),a=t.snapshot();return(r?r(i):t.add(i)===0)?(this.wallet-=e.price,{ok:!0,item:i}):(a(),{ok:!1,reason:`space`})}sellValue(e){let t=zl(e.defId),n=this.entry(e.defId),r=Hp.sellFraction;if(t.stackable){let i=n?n.price/n.quantity:Hp.fallbackPrice[t.category]/Math.max(1,t.boxQuantity??1);return Math.floor(i*e.quantity*r)}return Math.floor((n?.price??Hp.fallbackPrice[t.category])*r)}sell(e){let t=this.sellValue(e);return this.wallet+=t,t}},nm=class{engine;kind=`sandbox`;session;respawnLeft=-1;constructor(e){this.engine=e}init(){this.session=new jp(this.engine,{map:Np,npcs:nf,regen:!0,tutorial:`WASD MOVE  CLICK SHOOT  R RELOAD  C CROUCH  1-3 WEAPONS  E USE  I INVENTORY`},{onPlayerDeath:()=>this.onPlayerDeath(),step:e=>this.step(e),drawHud:(e,t)=>Vp(e,t,this.purse.dollars)}),this.openMerchants()}purse={dollars:q.sandbox.startingDollars,earned:0};openMerchants(){let e=this.session;for(let t of e.npcs.npcs){let n=t.def.shop?Rp[t.def.shop]:void 0;if(!n)continue;let r=new tm(n.stock,this.purse);t.onTrade=t=>e.openUi(()=>e.ui.openShop({economy:r,wave:()=>1/0,title:n.title,merchantName:t.name,buys:e=>n.buys.includes(zl(e.defId).category)}))}}onPlayerDeath(){this.respawnLeft=q.player.respawnTime}step(e){this.respawnLeft<0||(this.respawnLeft-=e,this.respawnLeft<=0&&(this.respawnLeft=-1,this.session.revivePlayer(1,this.session.map.playerSpawn.clone()),this.session.npcs.calmAll()))}update(e){this.session.frame(e)}render(e){this.session.render(e,!0)}dispose(){this.session.dispose()}};function rm(e,t,n,r){for(let i of e)if(Math.hypot(i[0]-t,i[1]-n)>=r)return i;return e[e.length-1]}var im=class{nav;path=null;pathGoal=null;repathLeft=0;constructor(e){this.nav=e}heading(e,t,n){let{x:r,z:i}=t.pos,a=n;if(this.nav.walkable(r,i,n[0],n[1]))this.path=null;else{this.repathLeft-=e;let t=!this.pathGoal||Math.hypot(this.pathGoal[0]-n[0],this.pathGoal[1]-n[1])>3;(!this.path||this.repathLeft<=0||t)&&(this.path=this.nav.findPath(r,i,n[0],n[1]),this.pathGoal=n,this.repathLeft=.6),this.path&&this.path.length>0&&(a=rm(this.path,r,i,4))}return yl(a[0]-r,a[1]-i)}},am=class{nav;radius;dir=Math.random()<.5?1:-1;flipLeft=10+Math.random()*8;steer;constructor(e,t=q.wave.orbitRadius){this.nav=e,this.radius=t,this.steer=new im(e)}drive(e,t,n){this.flipLeft-=e,this.flipLeft<=0&&(this.flipLeft=12+Math.random()*8,this.dir=-this.dir);let r=t.pos.x-n.x,i=t.pos.z-n.z,a=Math.hypot(r,i),o=this.radius,s;if(a>o+8)s=[n.x,n.z];else{let e=Math.atan2(i,r)+this.dir*.75,t=o+(a-o)*.4;s=[n.x+Math.cos(e)*t,n.z+Math.sin(e)*t],s=this.nav.nearestFree(s[0],s[1],4)??s,this.nav.isFree(s[0],s[1])||(this.dir=-this.dir)}return{target:this.steer.heading(e,t,s),gallop:a>o+3}}};function om(e,t,n,r=!0){let i=new im(e),a=!1;return(e,o)=>{let s=Math.hypot(t[0]-o.pos.x,t[1]-o.pos.z);return n!==null&&(a||s<n)?(a=!0,{target:null,gallop:!1}):n===null&&s<2?{target:o.heading,gallop:r}:{target:i.heading(e,o,t),gallop:r&&(n===null||s>n+6)}}}var sm=30,cm=33,lm=[new V(0,0,-31.5),new V(-31.5,0,9),new V(-11,0,31.5),new V(12.5,0,31.5),new V(31.5,0,-9)],um={wagon:new V(7,0,4),stand:new V(5.4,0,6.6),facing:Math.PI*.85},dm=new V(-3.5,0,4.5);function fm(e,t,n,r,i,a){let o=i-n,s=a-r,c=Math.max(0,Math.min(1,((e-n)*o+(t-r)*s)/(o*o+s*s)));return Math.hypot(e-(n+o*c),t-(r+s*c))}var pm=new Map;function mm(e,t,n,r){let i=`${e},${t}`;if(!r&&pm.has(i))return pm.get(i);let a=xl(e*.08,t*.08,17)*.7+xl(e*.22,t*.22,4)*.3,o=a<.34?J.sandDark:a<.66?J.sand:J.sandLight,s=n.next();s<.02&&(o=J.sandPale),Math.hypot(e,t)<11+a*3&&(o=a<.5?11569752:J.sandDark);for(let n of lm){let r=fm(e,t,n.x,n.z,0,0);r<1.9&&Math.abs(r-.9)<.4&&s<.75&&(o=9333830)}return(Math.abs(e)>31||Math.abs(t)>31)&&(o=a<.5?J.sandDark:10124386),pm.set(i,o),o}function hm(e){let t=new bl(777),n=new U,r=new ad,i=new sd(cm),a=[],o=[],s=(e,t,n,r)=>o.push({minX:e-n,minZ:t-r,maxX:e+n,maxZ:t+r});n.add(md(mm));let c=1.4;Md(r,i,-33,-30,-3,-30,6,t),Md(r,i,3,-30,cm,-30,6,t),Md(r,i,-30,-33,-30,6,6,t),Md(r,i,-30,12,-30,cm,6,t),Md(r,i,-33,sm,-14,sm,c,t),Md(r,i,-8,sm,10,sm,c,t),Md(r,i,15,sm,cm,sm,c,t),Md(r,i,sm,-33,sm,-12,c,t),Md(r,i,sm,-6,sm,cm,c,t);for(let e of[-14.3,-7.7,9.7,15.3])r.box(.22,1.3,.22,J.wood,e,0,30.2),r.box(.26,.06,.26,J.darkBrown,e,1.3,30.2);r.put(new mi(2.4,.1,.1),J.woodLight,-11,.12,30.8,0,.4,0),xd(r,i,-2.5,-3),kd(r,i,um.wagon.x,um.wagon.z,0,`covered`),s(um.wagon.x,um.wagon.z,.8,1.6);for(let[e,t,n]of[[-9,-8,.6],[11,-11,-.4]])kd(r,i,e,t,n,`broken`),s(e,t,1.2,1.2);kd(r,i,-16,13,1.4,`intact`),s(-16,13,1.5,1),yd(r,i,-1.5,-10.5),yd(r,i,13,1.5),s(-1.5,-10.5,1.1,.4),s(13,1.5,1.1,.4);for(let[e,n]of[[-5,8],[8,-4.5],[-13,-13],[14,14],[-21,-2],[21,5]])vd(r,i,e,n,t),vd(r,i,e+.95,n+.2,t),_d(r,i,e-.4,n+1.1,t),t.next()<.6&&_d(r,i,e+1.4,n+1.2,t),s(e+.5,n+.5,1.3,1.2);for(let[e,n,a,o]of[[-12,3,3,!1],[3,13,3.5,!0],[17.5,-3,3,!1],[-3,-17,3.5,!0],[21,-19,3,!0],[-22,18,3,!0]])Ad(r,i,e,n,a,o,t),s(e,n,o?a/2:.3,o?.3:a/2);for(let[e,r,o,c]of[[-17,-19,7,6],[16,-20,6,5]]){let l=new ad;jd(l,i,e,r,o,c,t);let u=Yl(),d=l.build(u),f=new jn().setFromObject(d);a.push({mesh:d,fade:u.userData.uFade,minX:f.min.x,minZ:f.min.z,maxX:f.max.x,maxZ:f.max.z,height:f.max.y}),n.add(d),s(e,r,o/2,c/2)}for(let[e,n]of[[-25,-25],[24,-24],[-25,21],[25,23],[-23,-9],[23,12],[-8,-24],[9,24],[-26,2]])wd(r,i,e,n,t);for(let[e,n]of[[-19,23],[19,-26],[26,-16],[-26,-15],[5,-24]])Cd(r,i,e,n,t);for(let e=0;e<30;e++)Td(r,t.range(-27,27),t.range(-27,27),t);return Ed(r,t,36),n.add(r.build()),{group:n,collision:i,occluders:a,cover:o,half:cm,playerSpawn:new V(0,0,1.5),horseSpawn:null,horseYaw:0}}var gm=class{position;onTrade;name=Of(`male`);model=new bf({body:`male`,skin:J.skin,hair:J.cream,hairStyle:`short`,beard:J.cream,clothing:{hat:`cowboy_hat_tan`,top:`shirt_cream`,outerwear:`vest_brown`,legs:`trousers_brown`,boots:`boots_brown`,belt:`belt_leather`}},null);range=q.npc.talkRange;priority=2;promptHeight=2.3;open=!1;lookYaw;constructor(e,t,n){this.position=e,this.onTrade=n,this.lookYaw=t,this.model.face(t),this.model.root.position.copy(e)}get root(){return this.model.root}get label(){return`Trade with ${this.name}`}canInteract(){return this.open}interact(){this.onTrade()}animate(e,t){this.model.root.visible=this.open,this.open&&(Math.hypot(t.x-this.position.x,t.z-this.position.z)<6&&(this.lookYaw=yl(t.x-this.position.x,t.z-this.position.z)),this.model.animate(e,{speed:0,moveYaw:this.lookYaw,lookYaw:this.lookYaw,draw:0,recoil:0,reload:-1,lean:!1,talking:!1,flinch:0,cower:!1,crouch:0,inspect:!1,dead:!1,mounted:!1}))}},_m=class{tokens;t=-1;outcome=null;constructor(e=q.wave.revive.tokens){this.tokens=e}get dying(){return this.t>=0}onDeath(){return this.t=0,this.outcome=this.tokens>0?`revive`:`gameover`,this.outcome===`revive`&&this.tokens--,this.outcome}get timeScale(){let e=q.wave.revive;return this.dying&&this.t<e.slowMoTime?e.slowMo:1}update(e){if(!this.dying)return null;this.t+=e;let t=q.wave.revive;if(this.t>=t.getUpAfter){let e=this.outcome;return this.t=-1,this.outcome=null,e===`revive`?`getUp`:`gameover`}return null}},vm=class{engine;host;kind=`wave`;session;economy=new tm;revive=new _m;director;enemies=[];horseNav;playerHorses=new Set;loose=[];merchant;kills=0;time=0;banner=null;pops=[];nextId=1;over=!1;constructor(e,t,n){this.engine=e,this.host=t,this.director=new em(n.startWave??1)}init(){this.session=new jp(this.engine,{map:hm,npcs:[],regen:!1,tutorial:`SURVIVE THE WAVES   G BANDAGE   C CROUCH   TRADE AT THE WAGON BETWEEN WAVES`},{onPlayerDeath:()=>this.onPlayerDeath(),onNpcDeath:(e,t)=>this.onNpcDeath(e,t),step:e=>this.step(e),interactables:()=>[this.merchant],drawHud:(e,t,n,r)=>this.drawHud(e,t,n,r)});let e=this.session;e.player.inventory.placeAnywhere(Mu(`bandage`,1)),this.horseNav=new zd(e.world,e.map.half,.5,.85),this.merchant=new gm(um.stand.clone(),um.facing,()=>e.openUi(()=>e.ui.openShop({economy:this.economy,wave:()=>this.director.wave+ +(this.director.phase===`intermission`),title:this.merchant.name,merchantName:this.merchant.name}))),e.scene.add(this.merchant.root),this.handle(this.director.start())}update(e){let t=this.session,n=this.revive.update(e);n===`getUp`&&this.getUp(),n===`gameover`&&!this.over?(this.over=!0,this.host.gameOver({wavesSurvived:Math.max(0,this.director.wave-(this.director.phase===`intermission`?0:1)),waveReached:this.director.wave,kills:this.kills,dollarsEarned:this.economy.earned,timeSurvived:this.time})):(t.timeScale=this.revive.timeScale,this.engine.input.consume(`Enter`)&&!t.ui.open&&this.director.phase===`intermission`&&this.handle(this.director.skipIntermission()),t.frame(e),this.merchant.animate(t.ui.open?0:e,t.player.pos))}render(e){this.session.render(e,!0)}dispose(){this.session.dispose()}get alive(){return this.enemies.filter(e=>e.npc.alive)}step(e){this.time+=e,this.handle(this.director.update(e,this.alive.length)),this.merchant.open=this.director.phase===`intermission`&&!this.session.player.dead,this.banner&&(this.banner.left-=e,this.banner.left<=0&&(this.banner=null));for(let t of this.pops)t.age+=e;this.pops=this.pops.filter(e=>e.age<1.6),this.updateLooseHorses(e)}handle(e){for(let t of e)switch(t.type){case`countdown`:this.showBanner(`WAVE ${t.wave}`,`GET READY`,q.wave.countdown);break;case`waveStart`:this.showBanner(`WAVE ${t.wave}`,`${t.count} OUTLAWS INCOMING`,2);break;case`spawn`:this.spawnEnemy(t.enemy,t.wave);break;case`waveCleared`:this.economy.earn(t.bonus),this.pop(`+$${t.bonus}`),this.showBanner(`WAVE CLEARED`,`+$${t.bonus}   E: TRADE AT THE WAGON`,q.wave.clearedBanner);break;case`horseArrives`:this.horseArrives();break;case`despawnCorpses`:this.despawnCorpses(t.upToWave)}}showBanner(e,t,n){this.banner={text:e,sub:t,left:n}}pop(e){this.pops.unshift({text:e,age:0}),this.pops.length=Math.min(this.pops.length,4)}spawnPoint(){let e=this.session.player.pos,t=this.engine.rig.view,n=lm.filter(n=>{if(n.distanceTo(e)<q.wave.minSpawnDistance)return!1;let r=n.clone().setY(1).project(t);return Math.abs(r.x)>1.05||Math.abs(r.y)>1.05});return n.length>0?n[Math.floor(Math.random()*n.length)]:[...lm].sort((t,n)=>n.distanceTo(e)-t.distanceTo(e))[0]}spawnEnemy(e,t){let n=this.session,r=Wp[e.archetype],i=e.mounted?r.mountedWeapon??r.weapon:r.weapon,a=Ul(Il(i).ammoType),o=r.ammoBoxes[0]+Math.floor(Math.random()*(r.ammoBoxes[1]-r.ammoBoxes[0]+1)),s=this.spawnPoint(),c={id:`outlaw-${this.nextId++}`,attitude:`hostile`,defendsOthers:!1,appearance:qp(r),weapon:i,inventory:a?Array.from({length:o},()=>({item:a.id})):[],spawn:[s.x,s.z],routine:{kind:`idle`,at:[s.x,s.z],facing:yl(-s.x,-s.z)},hp:Math.round(r.hp*e.hp),inaccuracy:r.inaccuracy*e.accuracy,reactionTime:r.reactionTime*e.reaction,tactics:r.tactics,respawns:!1},l=n.npcs.add(c);if(n.registerNpc(l),this.enemies.push({npc:l,wave:t,spawn:e}),n.particles.burst(`dust`,s.clone().setY(.2),void 0,1.5),e.mounted){let e=n.addHorse(new ef,s,yl(-s.x,-s.z));l.mountOn(e);let t=new am(this.horseNav);e.driver=r=>t.drive(r,e,n.player.pos)}}onNpcDeath(e,t){let n=this.enemies.find(t=>t.npc===e);if(!n)return;let r=e.mount;if(t){this.kills++;let e=this.economy.killReward(n.spawn.archetype,!!r);this.economy.earn(e),this.pop(`+$${e}`)}r&&(e.dismount(this.session.npcs.group),r.driver=null,this.loose.push({horse:r,left:q.wave.riderlessStay,leaving:!1}))}despawnCorpses(e){let t=this.session;this.enemies=this.enemies.filter(n=>n.npc.alive||n.wave>e?!0:(t.npcs.remove(n.npc),t.targets.removeActor(n.npc),!1))}horseArrives(){let e=this.session,t=lm[4],n=e.addHorse(new ef,t,yl(-t.x,-t.z));this.playerHorses.add(n);let r=om(this.horseNav,[dm.x,dm.z],1.5);n.driver=e=>r(e,n),this.showBanner(`A HORSE HAS ARRIVED!`,`E TO MOUNT`,3.5)}updateLooseHorses(e){let t=this.session;this.loose=this.loose.filter(n=>{let r=n.horse;if(t.riding===r||this.playerHorses.has(r))return this.playerHorses.add(r),!1;if(!n.leaving){if(n.left-=e,n.left<=0){n.leaving=!0;let e=[...lm].sort((e,t)=>e.distanceTo(r.pos)-t.distanceTo(r.pos))[0].clone().multiplyScalar(1.15),t=om(this.horseNav,[e.x,e.z],null);r.driver=e=>t(e,r)}return!0}return Math.abs(r.pos.x)>t.map.half-.9||Math.abs(r.pos.z)>t.map.half-.9?(t.removeHorse(r),!1):!0})}onPlayerDeath(){let e=this.revive.onDeath();this.session.deathMessage=e===`revive`?`DOWN... BUT NOT OUT`:`YOU DIED`}getUp(){let e=this.session,t=q.wave.revive;e.revivePlayer(t.hp),e.player.invulnerable=t.invulnerable;let n=e.player.pos;for(let r of this.alive){let i=r.npc;if(i.mount)continue;let a=i.pos.x-n.x,o=i.pos.z-n.z,s=Math.hypot(a,o);if(s>t.knockbackRadius)continue;let c=t.knockback*(1-s/t.knockbackRadius)+1,l={x:i.pos.x+a/Math.max(s,.01)*c,z:i.pos.z+o/Math.max(s,.01)*c};e.world.resolveCircle(l,q.npc.radius),i.pos.set(l.x,0,l.z),i.prevPos.copy(i.pos),i.stagger()}e.particles.burst(`dust`,n.clone().setY(.2),void 0,2.5),this.engine.rig.addTrauma(.6),this.showBanner(`BACK ON YOUR FEET`,`NO MORE REVIVES`,2)}drawHud(e,t,n,r){let i=this.director,a=this.alive,o={wave:i.wave,phase:i.phase,timer:i.timer,enemiesLeft:a.length+i.pending,wallet:this.economy.wallet,reviveTokens:this.revive.tokens,banner:this.banner?{text:this.banner.text,sub:this.banner.sub,alpha:Math.min(1,this.banner.left*2)}:null,pops:this.pops,pointers:i.phase===`active`?a.filter(e=>a.length+i.pending<=3||e.npc.mode===`flee`||e.npc.mode===`hide`).map(e=>this.session.project(e.npc.pos.x,1.2,e.npc.pos.z)):[]};this.hudTime+=r,Bp(e,t,n,o,this.hudTime)}hudTime=0},ym=new Du(document.getElementById(`app`)),bm=new Ld(ym,{sandbox:e=>new nm(e),wave:(e,t,n)=>new vm(e,t,n)});bm.boot(new URLSearchParams(location.search)),ym.start(e=>bm.frame(e)),window.game={engine:ym,states:bm,get session(){return bm.mode?.session??null}};