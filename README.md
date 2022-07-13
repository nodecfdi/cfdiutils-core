# `@nodecfdi/cfdiutils-core`

[![Source Code][badge-source]][source]
[![Npm Node Version Support][badge-node-version]][node-version]
[![Discord][badge-discord]][discord]
[![Latest Version][badge-release]][release]
[![Software License][badge-license]][license]
[![Build Status][badge-build]][build]
[![Reliability][badge-reliability]][reliability]
[![Maintainability][badge-maintainability]][maintainability]
[![Code Coverage][badge-coverage]][coverage]
[![Violations][badge-violations]][violations]
[![Total Downloads][badge-downloads]][downloads]

> Core of CfdiUtils

:us: The documentation of this project is in spanish as this is the natural language for intented audience.

:mexico: La documentación del proyecto está en español porque ese es el lenguaje principal de los usuarios.

## Acerca de `@nodecfdi/cfdiutils-core`

Esta es una libreria que contiene muchas clases de ayuda, es la parte principal del set de librerias cfdiutils.

Libreria inspirada por la versión para php <https://github.com/eclipxe13/CfdiUtils>

## Instalación

```shell
npm i @nodecfdi/cfdiutils-core --save
```

o

```shell
yarn add @nodecfdi/cfdiutils-core
```

## Cadena de origen

El SAT utiliza el método de generar cadenas originales para agrupar en una forma y orden determinados la información que no debería ser alterada de un CFDI.

Una vez que se cuenta con la cadena de origen, se genera una firma con la llave privada que puede ser verificada con un certificado (llave pública).

Si algún dato (que es parte de la cadena de origen) fue modificado entonces producirá un sello diferente o la verificación del sello será negativa.

Esto significa que un CFDI podría ser alterado posteriormente a su elaboración. Por ejemplo, se le puede agregar una adenda o poner/quitar formato al XML, pues ni el nodo Addenda ni el "XML Whitespace" forman parte de la cadena de origen.

Incluso, es frecuente "reparar" un CFDI que tiene errores como una adenda sin XSD o errores sintácticos como poner un número par de rutas en el atributo `xsi:schemaLocation` o eliminar espacios de nombres no utilizados.

### Generar una cadena de origen

Para generar cadenas de origen se pueden aplicar diferentes implementaciones de la interfaz `XsltBuilderInterface`. La cual contiene un único método `build(xmlContent: string, xsltLocation: string)`.

El parámetro `xmlContent` es el XML que se desea convertir y el parámetro `xsltLocation` es la ubicación del archivo XSLT (local).

Las implementaciónes incluidas son:

- `SaxonbCliBuilder`: Utiliza la herramienta [Saxon-B XSLT Processor](https://en.wikipedia.org/wiki/Saxon_XSLT) desde la ejecución por línea de comandos. Esta utilería presume la implementación de Xslt versión 2.
Para usarla debes hacer algo como `apt-get install libsaxonb-java`.

### Generar la cadena de origen de un comprobante

Se puede seguir esta receta:

```ts
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom'; // or can use other lib implementation for example jsDom
import { XmlResolver, SaxonbCliBuilder } from '@nodecfdi/cfdiutils-core';
import { readFileSync } from 'fs';

// from version 1.2.x on @nodecfdi/cfdiutils-common required install dom resolution
install(new DOMParser(), new XMLSerializer(), new DOMImplementation());

// el contenido del cfdi
const xmlContent = readFileSync('...archivo xml', 'utf-8');

// usar el resolvedor para usar los recursos descargados
const resolver = new XmlResolver();

// el resolvedor tiene un método de ayuda para obtener la ubicación del XSLT
// dependiendo de la versión del comprobante
const location = resolver.resolveCadenaOrigenLocation('3.3');

// fabricar la cadena origen
const builder = new SaxonbCliBuilder('The executable path for SaxonB');
const cadenaOrigen = await builder.build(xmlContent, location);
```

### Generar la cadena origen de un Timbre Fiscal Digital

A diferencia de la cadena de origen del Comprobante, la cadena de origen del Timbre Fiscal Digital sí se necesita al menos para mostrarla en la representación impresa del CFDI.

Para ello puedes utilizar la clase `TfdCadenaDeOrigen`. Esta clase solo funciona con TFD versiones 1.0 y 1.1. En caso de otra versión genera una excepción.

Esta clase depende de las propiedades `XmlResolver` para obtener los archivos XSLT y de `XsltBuilder` para hacer la transformación.

```ts
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom'; // or can use other lib implementation for example jsDom
import { TfdCadenaDeOrigen } from '@nodecfdi/cfdiutils-core';

// from version 1.2.x on @nodecfdi/cfdiutils-common required install dom resolution
install(new DOMParser(), new XMLSerializer(), new DOMImplementation());

const tfdXmlString = '<tfd:TimbreFiscalDigital xmlns:tfd="..." />';

const builder = new TfdCadenaOrigen();

// Para cambiar el XmlResolver (por omisión crea uno nuevo)
/** myXmlResolver: XmlResolver **/
builder.setXmlResolver(myXmlResolver);

const tdfCadenaOrigen = await builder.build(tfdXmlString);
```

Si no cuentas con el código XML del Timbre Fiscal Digital esta receta te puede ayudar:

```ts
import { install, XmlNodeUtils } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom'; // or can use other lib implementation for example jsDom
import { readFileSync } from 'fs';

// from version 1.2.x on @nodecfdi/cfdiutils-common required install dom resolution
install(new DOMParser(), new XMLSerializer(), new DOMImplementation());

const cfdiFile = '/facturas/.../fei-123456.xml';
const cfdi = XmlNodeUtils.nodeFromXmlString(readFileSync(cfdiFile, 'utf-8'));
const tfd = cfdi.searchNode('cfdi:Complemento', 'tfd:TimbreFiscalDigital');

// Puedes habilitar esta linea si por alguna razon no contiene el namespace xsi
// tfd.attributes().set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');

const tfdXmlString = XmlNodeUtils.nodeToXmlString(tfd);
```

## NodeCertificado

La clase [Certificate](https://nodecfdi.github.io/credentials/classes/certificate.Certificate.html) funciona con un archivo previamente almacenado. Para extraer un certificado de un CFDI se ofrece la clase `NodeCertificado`.

Esta clase puede trabajar con CFDI versión 3.2, 3.3 y 4.0, toma la información de `cfdi:Comprobante@Certificado` utilizando [CNodeInterface](https://nodecfdi.github.io/cfdiutils-common/modules/index.html#CNodeInterface) y provee tres métodos para trabajar con el certificado:

- `extract(): string`: obtiene el contenido del certificado acorde a la versión y decodifica desde base 64.
- `save(filename: string): void`: guarda el contenido extraído a una ruta.
- `obtain(): Certificate`: obtiene el objeto certificado del archivo extraído.

```ts
import { install, XmlNodeUtils } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom'; // or can use other lib implementation for example jsDom
import { readFileSync } from 'fs';
import { NodeCertificado } from '@nodecfdi/cfdiutils-core';

// from version 1.2.x on @nodecfdi/cfdiutils-common required install dom resolution
install(new DOMParser(), new XMLSerializer(), new DOMImplementation());

const certificate = new NodeCertificado(XmlNodeUtils.nodeFromXmlString(readFileSync('/cfdis/FE-00012847.xml', 'utf-8'))).obtain();

console.log(certificate.rfc()); // algo como COSC8001137NA
```

## Descarga de certificados desde el SAT

Es necesario descargar los certificados de los PAC para poder validar el atributo SelloCFDI del nodo tfd:TimbreFiscalDigital porque no viene incluido en la estructura.

Siendo así, se utilizan las clases `SatCertificateNumber` y la clase `CerRetriever`.

SatCertificateNumber contiene el método remoteUrl(): string que devuelve una URL que apunta a <https://rdc.sat.gob.mx/rccf/>.

## Soporte

Puedes obtener soporte abriendo un ticket en Github.

Adicionalmente, esta librería pertenece a la comunidad [OcelotlStudio](https://ocelotlstudio.com), así que puedes usar los mismos canales de comunicación para obtener ayuda de algún miembro de la comunidad.

## Compatibilidad

Esta librería se mantendrá compatible con al menos la versión con
[soporte activo de Node](https://nodejs.org/es/about/releases/) más reciente.

También utilizamos [Versionado Semántico 2.0.0](https://semver.org/lang/es/) por lo que puedes usar esta librería sin temor a romper tu aplicación.

## Contribuciones

Las contribuciones con bienvenidas. Por favor lee [CONTRIBUTING][] para más detalles y recuerda revisar el archivo [CHANGELOG][].

## Copyright and License

The `@nodecfdi/cfdiutils-core` library is copyright © [NodeCfdi](https://github.com/nodecfdi) - [OcelotlStudio](https://ocelotlstudio.com) and licensed for use under the MIT License (MIT). Please see [LICENSE][] for more information.

[contributing]: https://github.com/nodecfdi/cfdiutils-core/blob/main/CONTRIBUTING.md
[changelog]: https://github.com/nodecfdi/cfdiutils-core/blob/main/CHANGELOG.md

[source]: https://github.com/nodecfdi/cfdiutils-core
[node-version]: https://www.npmjs.com/package/@nodecfdi/cfdiutils-core
[discord]: https://discord.gg/AsqX8fkW2k
[release]: https://www.npmjs.com/package/@nodecfdi/cfdiutils-core
[license]: https://github.com/nodecfdi/cfdiutils-core/blob/main/LICENSE
[build]: https://github.com/nodecfdi/cfdiutils-core/actions/workflows/build.yml?query=branch:main
[reliability]:https://sonarcloud.io/component_measures?id=nodecfdi_cfdiutils-core&metric=Reliability
[maintainability]: https://sonarcloud.io/component_measures?id=nodecfdi_cfdiutils-core&metric=Maintainability
[coverage]: https://sonarcloud.io/component_measures?id=nodecfdi_cfdiutils-core&metric=Coverage
[violations]: https://sonarcloud.io/project/issues?id=nodecfdi_cfdiutils-core&resolved=false
[downloads]: https://www.npmjs.com/package/@nodecfdi/cfdiutils-core

[badge-source]: https://img.shields.io/badge/source-nodecfdi/cfdiutils--core-blue.svg?logo=github
[badge-node-version]: https://img.shields.io/node/v/@nodecfdi/cfdiutils-core.svg?logo=nodedotjs
[badge-discord]: https://img.shields.io/discord/459860554090283019?logo=discord
[badge-release]: https://img.shields.io/npm/v/@nodecfdi/cfdiutils-core.svg?logo=npm
[badge-license]: https://img.shields.io/github/license/nodecfdi/cfdiutils-core.svg?logo=open-source-initiative
[badge-build]: https://img.shields.io/github/workflow/status/nodecfdi/cfdiutils-core/build/main?logo=github-actions
[badge-reliability]: https://sonarcloud.io/api/project_badges/measure?project=nodecfdi_cfdiutils-core&metric=reliability_rating
[badge-maintainability]: https://sonarcloud.io/api/project_badges/measure?project=nodecfdi_cfdiutils-core&metric=sqale_rating
[badge-coverage]: https://img.shields.io/sonar/coverage/nodecfdi_cfdiutils-core/main?logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io
[badge-violations]: https://img.shields.io/sonar/violations/nodecfdi_cfdiutils-core/main?format=long&logo=sonarcloud&server=https%3A%2F%2Fsonarcloud.io
[badge-downloads]: https://img.shields.io/npm/dm/@nodecfdi/cfdiutils-core.svg?logo=npm
