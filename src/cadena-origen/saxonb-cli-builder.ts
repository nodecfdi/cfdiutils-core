import { accessSync, constants, existsSync, statSync, write } from 'fs';
import { cleanupSync, open } from 'temp';
import { exec } from 'child_process';

import { AbstractXsltBuilder } from './abstract-xslt-builder';
import { XsltBuildException } from './xslt-build-exception';

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

    private retrieveValidExecutable(): string {
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

        return executable;
    }

    private isValidXslt(xsltLocation: string): void {
        if (!existsSync(xsltLocation)) {
            throw new XsltBuildException('Xslt location was not found');
        }
    }

    public build(xmlContent: string, xsltLocation: string): Promise<string> {
        this.assertBuildArgument(xmlContent, xsltLocation);
        const executable = this.retrieveValidExecutable();
        this.isValidXslt(xsltLocation);

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
                    const finalCommand = `${executable} ${args.join(' ')}`;
                    exec(
                        finalCommand,
                        {
                            maxBuffer: 1024 * 1024 * 100 // 100MB
                        },
                        (errorCmd, stdout, stderr) => {
                            cleanupSync();
                            if (errorCmd) {
                                return reject(new XsltBuildException(`Transformation error: ${stderr}`));
                            }

                            if ('<?xml version="1.0" encoding="UTF-8"?>' === stdout.trim()) {
                                return reject(new XsltBuildException('Transformation error'));
                            }

                            return resolve(stdout.trim());
                        }
                    );
                });
            });
        });
    }
}
