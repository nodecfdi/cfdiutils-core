import { AbstractXsltBuilder } from './abstract-xslt-builder';
import { accessSync, constants, existsSync, statSync, write } from 'fs';
import { XsltBuildException } from './xslt-build-exception';
import { cleanupSync, open } from 'temp';
import { spawn } from 'child_process';

export class SaxonbCliBuilder extends AbstractXsltBuilder {
    private _executablePath!: string;

    constructor(executablePath: string) {
        super();
        this.setExecutablePath(executablePath);
    }

    public setExecutablePath(executablePath: string): void {
        if ('' === executablePath) {
            throw new SyntaxError('The executable path for SaxonB cannot be empty');
        }
        this._executablePath = executablePath;
    }

    public getExecutablePath(): string {
        return this._executablePath;
    }

    public build(xmlContent: string, xsltLocation: string): Promise<string> {
        this.assertBuildArgument(xmlContent, xsltLocation);

        const executable = this.getExecutablePath();
        if (!existsSync(executable)) {
            throw new XsltBuildException('The executable path for SaxonB does not exists');
        }
        if (statSync(executable).isDirectory()) {
            throw new XsltBuildException('The executable path for SaxonB is a directory');
        }
        try {
            accessSync(executable, constants.X_OK);
        } catch (e) {
            throw new XsltBuildException('The executable path for SaxonB is not executable');
        }

        return new Promise<string>((resolve, reject) => {
            open({ suffix: 'xml' }, (err, info) => {
                if (err) {
                    return reject(new XsltBuildException('Error while loading the xml content'));
                }
                write(info.fd, xmlContent, (error) => {
                    if (error) {
                        return reject(new XsltBuildException('Error while loading the xml content'));
                    }
                    const args: string[] = [];
                    args.push(`-s:${info.path}`);
                    args.push(`-xsl:${xsltLocation}`);
                    args.push('-warnings:silent');
                    const xslt = spawn(executable, args);
                    xslt.stdout.on('data', (data: string) => {
                        cleanupSync();
                        if ('<?xml version="1.0" encoding="UTF-8"?>' === `${data}`.trim()) {
                            reject(new XsltBuildException('Transformation error'));
                        }
                        return resolve(`${data}`.trim());
                    });

                    xslt.stderr.on('data', (data: string) => {
                        cleanupSync();
                        return reject(new XsltBuildException(`Transformation error: ${data}`));
                    });

                    xslt.on('exit', (code: number | string) => {
                        cleanupSync();
                        return reject(new XsltBuildException(`Transformation error with code: ${code}`));
                    });
                });
            });
        });
    }
}
