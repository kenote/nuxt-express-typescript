import * as crypto from 'crypto'
import * as passport from '@/types/passport'

export const md5 = (text: string): string => crypto.createHash('md5').update(text).digest('hex')

export const sha1 = (text: string): string => crypto.createHash('sha1').update(text).digest('hex')

class Bcrypt {

  public hash (value: string, salt?: string): passport.Password {
    salt = salt || Math.random().toString(36).substr(8)
    let password: passport.Password = { salt, hash: sha1(`${md5(value)}^${salt}`) }
    return password
  }

  public compare (value: string, hash: string, salt: string): boolean {
    let password: passport.Password = this.hash(value, salt)
    return password.hash === hash
  }
}

export const bcrypt: Bcrypt = new Bcrypt()



